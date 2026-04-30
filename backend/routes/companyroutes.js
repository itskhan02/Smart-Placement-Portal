const router = require("express").Router();
const companyController = require("../controllers/companyController");
const { isAuthenticate, authorizeRoles } = require("../middleware/isAuthenticated");
const { upload, handleMulterError } = require("../middleware/upload");


router.post("/create", isAuthenticate, authorizeRoles("recruiter"),upload.single("logo"), handleMulterError, companyController.createCompany
);

router.get( "/getall", isAuthenticate, authorizeRoles("recruiter"),companyController.getAllCompanies
);

router.get("/get/:id", isAuthenticate, authorizeRoles("recruiter"),companyController.getCompanyById
);

router.put("/update/:id", isAuthenticate, authorizeRoles("recruiter"), upload.single("logo"), handleMulterError,
companyController.updateCompany
);

module.exports = router;