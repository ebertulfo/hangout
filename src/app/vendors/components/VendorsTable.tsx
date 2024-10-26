"use client";

import { AuthContext } from "@/app/_contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase/firebase";
import { IVendor } from "@/types";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import VendorAddDialog from "./VendorAddDialog";
import VendorEditDialog from "./VendorEditDialog";

export function VendorsTable() {
  const user = useContext(AuthContext);
  const [vendors, setvendors] = useState<IVendor[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, "vendors"),
        where("userId", "==", user?.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newvendors: IVendor[] = [];
        snapshot.forEach((doc) => {
          newvendors.push({ ...doc.data(), id: doc.id } as IVendor);
        });
        setvendors(newvendors);
        return () => unsubscribe();
      });
    }
  }, [user]);

  return (
    <div>
      <VendorAddDialog />
      <Table>
        <TableCaption>A list of your vendors.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.createdAt}</TableCell>
              <TableCell>
                <a href={`/vendors/${vendor.id}`} className="mr-2">
                  Manage
                </a>
                <VendorEditDialog vendor={vendor} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
