// Central enum-style role definitions.
// Hierarchy: Platform Admin → University Admin → College Admin → Faculty → Society (Core → Head → Member)

export const ROLES = {
  ADMIN: "ADMIN", // Platform admin (PlatformConfig.adminEmails)
  UNIVERSITY_ADMIN: "UNIVERSITY_ADMIN",
  COLLEGE_ADMIN: "COLLEGE_ADMIN",
  FACULTY: "FACULTY",
  CORE: "CORE",
  HEAD: "HEAD",
  MEMBER: "MEMBER",
  PRESIDENT: "PRESIDENT", // Society president (enrolled member role)
  STUDENT: "STUDENT",
};

export const ROLE_HIERARCHY = [
  ROLES.ADMIN,
  ROLES.UNIVERSITY_ADMIN,
  ROLES.COLLEGE_ADMIN,
  ROLES.FACULTY,
  ROLES.CORE,
  ROLES.HEAD,
  ROLES.MEMBER,
  ROLES.PRESIDENT,
  ROLES.STUDENT,
];

