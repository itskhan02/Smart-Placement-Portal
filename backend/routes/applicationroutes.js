const router = require("express").Router();
const applicationController = require("../controllers/applicationController");
const { isAuthenticate, authorizeRoles } = require("../middleware/isAuthenticated");


router.post("/apply/:id", isAuthenticate, authorizeRoles("student"),applicationController.applyJob
);

router.get("/applied-jobs", isAuthenticate, authorizeRoles("student"),applicationController.getAppliedJobs
);

router.get(
  "/recruiter/all",
  isAuthenticate,
  authorizeRoles("recruiter"),
  applicationController.getAllApplicantsForRecruiter
);

router.get("/:id/applicants", isAuthenticate, authorizeRoles("recruiter"),applicationController.getapplicants
);

router.get("/get", isAuthenticate, applicationController.getAppliedJobs);


router.put("/status/:id/update", isAuthenticate, authorizeRoles("recruiter"),
applicationController.updateStatus
);

router.delete(
  "/deleted-job/:id",
  isAuthenticate,
  authorizeRoles("student", "admin"),
  applicationController.deleteDeletedJobApplication
);

module.exports = router; 
