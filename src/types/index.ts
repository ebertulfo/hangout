export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface IEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  time: string;
  vendors: IVendorInEvent[];
  attendees: IAttendee[];
  rsvps: IRsvp[];
}

export interface IRsvp {
  id: string;
  name: string;
  email: string;
  floorPlanPrinted: boolean;
  phone: string;
  attended: boolean;
  vendorIds: string[];
}

export interface IVendorInEvent {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventId: string;
  vendorId: string;
  slots: number;
  meetings: IVendorInEventMeeting[];
}

export interface IVendorInEventMeeting {
  attendeeId: string;
  attendeeName: string;
  attendeeIdentifier: string;
  meetingStartedAt: string;
  meetingEndedAt: string;
}

export interface IVendor {
  id: string;
  vendorId: string;
  name: string;
  createdAt: string;
  email: string;
  phone: string;
  eventIds: string[];
}

export interface IAttendee {
  id: string;
  identifier: string;
  name: string;
  email: string;
  phoneNumber: string;
  eventId: string;
  currentMeetingVendorId: string;
  currentMeetingStartedAt: string;
  status: "unassigned" | "waiting" | "in meeting";
  metVendorIds: string[];
}

export interface IMeeting {
  id: string;
  vendorId: string;
  attendeeId: string;
  eventId: string;
  startTime: string;
  notes: string;
  status: "started" | "ended" | "cancelled";
}

export interface IQueuedAttendee {
  id: string;
  eventId: string;
  attendeeIdentifier: string;
  attendeeId: string;
  attendeeName: string;
  vendorId: string;
  queuedAt: string;
}
