export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface IEvent {
  name: string;
  location: string;
  date: string;
  userId: string;
}
export interface IExistingEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  vendors?: IVendorInEvent[];
  attendees?: IAttendee[];
  rsvps?: IRsvp[];
  userId: string;
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
}

export interface IMeeting {
  vendorId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeIdentifier: string;
  meetingStartedAt: string;
  meetingEndedAt: string | null;
  buzzerNumber: string;
}

export interface IExistingMeeting {
  id: string;
  vendorId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeIdentifier: string;
  meetingStartedAt: string;
  meetingEndedAt: string | null;
  buzzerNumber: string;
  tenMinuteBuzzed: boolean;
  fiveMinuteBuzzed: boolean;
  timeUpBuzzed: boolean;
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

export interface IQueuedAttendee {
  id: string;
  eventId: string;
  attendee: IAttendee;
  vendorId: string;
  queuedAt: string;
  buzzerNumber: string;
}
