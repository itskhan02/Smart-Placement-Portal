const router = require("express").Router();
const  jobcontrollers = require('../controllers/jobcontrollers');
const { isAuthenticate, authorizeRoles } = require("../middleware/isAuthenticated");

// route

router.post("/", isAuthenticate, authorizeRoles("recruiter"), jobcontrollers.createJob);
router.get("/getall", isAuthenticate, authorizeRoles("recruiter"), jobcontrollers.getAllJobs);
router.get("/student/", isAuthenticate, jobcontrollers.getAllJobsForStudents);
router.get("/student/:id", isAuthenticate, jobcontrollers.getJobForStudent); 
router.get("/get/:id", isAuthenticate, authorizeRoles("recruiter"), jobcontrollers.getbyJob);
router.get("/details/:id", isAuthenticate, jobcontrollers.getJobForStudent);
router.put("/toggle/:id", isAuthenticate, authorizeRoles("recruiter"), jobcontrollers.toggleStatus);
router.delete("/delete/:id", isAuthenticate, authorizeRoles("recruiter"), jobcontrollers.deleteJob);


module.exports = router;