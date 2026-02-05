// Central enum-style role definitions.
// Business rules must use these constants instead of free-text strings.

export const ROLES = {
  ADMIN: "ADMIN",
  FACULTY: "FACULTY",
  CORE: "CORE",
  HEAD: "HEAD",
  MEMBER: "MEMBER",
  PRESIDENT: "PRESIDENT", // Society president (enrolled member role)
  STUDENT: "STUDENT",
};

export const ROLE_HIERARCHY = [
  ROLES.ADMIN,
  ROLES.FACULTY,
  ROLES.CORE,
  ROLES.HEAD,
  ROLES.MEMBER,
  ROLES.PRESIDENT,
  ROLES.STUDENT,
];

