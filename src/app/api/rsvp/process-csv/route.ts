import { NextRequest, NextResponse } from "next/server";
import csv from "csvtojson";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT as string
);
// Initialize Firebase Admin if it hasn't been initialized yet
let app: App;
if (getApps().length === 0) {
  if (!serviceAccount) {
    console.error("FIREBASE_PRIVATE_KEY is not set.");
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
  }
  app = initializeApp(
    {
      credential: cert(serviceAccount),
    },
    "firebase-admin-app"
  );
} else {
  app = getApps()[0];
}

export async function POST(req: NextRequest) {
  try {
    // Get the ID token from the Authorization header
    const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];

    if (!idToken) {
      return NextResponse.json(
        { status: "fail", data: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify the ID token
    try {
      await getAuth(app).verifyIdToken(idToken);
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json(
        { status: "fail", data: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const eventId = formData.get("eventId") as string;
    const file = formData.get("files") as File;

    console.log("Received eventId:", eventId);
    console.log("Received file:", file ? file.name : "No file");

    if (!eventId) {
      return NextResponse.json("eventId is missing or invalid", {
        status: 400,
      });
    }

    if (!file || file.type !== "text/csv") {
      return NextResponse.json(
        { status: "fail", data: "Invalid file type" },
        { status: 400 }
      );
    }

    // Convert the File object to a string
    const fileContent = await file.text();

    // Function to check if the CSV has the correct column names
    const checkCsvColumns = function (csvContent: string): boolean {
      // Split the CSV content into rows
      const rows = csvContent.split("\n");

      // Extract the first row (column names)
      const firstRow = rows[0];

      // Split the first row by comma to get the column names
      const columnNames = firstRow.split(",");

      // Define the required column names
      const requiredColumns = ["name", "email", "phone"];

      // Check if all required columns are present
      return requiredColumns.every((column) => columnNames.includes(column));
    };

    // Use the function to check the CSV columns
    const isValidCsv = checkCsvColumns(fileContent);
    console.log("Is valid CSV:", isValidCsv);
    if (!isValidCsv) {
      return NextResponse.json(
        {
          status: "fail",
          data: "CSV file does not conform to the correct column names.",
        },
        { status: 400 }
      );
    }

    // Convert CSV string to JSON
    const jsonArray = await csv().fromString(fileContent);
    console.log("Parsed JSON array length:", jsonArray.length);

    // Filter out duplicate rows based on email and phone field
    const filteredArray = jsonArray.reduce((acc: any[], current: any) => {
      const x = acc.find(
        (item: any) =>
          item.email === current.email && item.phone === current.phone
      );
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    console.log("Filtered array length:", filteredArray.length);
    const db = getFirestore(app);
    const batch = db.batch();
    const rsvpsCollectionRef = db
      .collection("events")
      .doc(eventId)
      .collection("rsvps");

    // First, query existing RSVPs
    const existingRsvpsSnapshot = await rsvpsCollectionRef.get();
    const existingRsvps = new Map();

    existingRsvpsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email) existingRsvps.set(data.email.toLowerCase(), doc.ref);
      if (data.phone) existingRsvps.set(data.phone, doc.ref);
    });

    // Process the filtered array
    for (const item of filteredArray) {
      let docRef;
      if (item.email && existingRsvps.has(item.email.toLowerCase())) {
        docRef = existingRsvps.get(item.email.toLowerCase());
      } else if (item.phone && existingRsvps.has(item.phone)) {
        docRef = existingRsvps.get(item.phone);
      } else {
        docRef = rsvpsCollectionRef.doc();
      }

      batch.set(docRef, item, { merge: true });
    }

    // Commit the batch
    try {
      await batch.commit();
      console.log("Batch write successful");
    } catch (error: any) {
      console.error("Error in batch write:", error);
      return NextResponse.json({ status: "fail", data: error.message });
    }

    return NextResponse.json({ status: "success", data: jsonArray });
  } catch (e: any) {
    console.error("Main error:", e);
    return NextResponse.json({ status: "fail", data: e.toString() });
  }
}
