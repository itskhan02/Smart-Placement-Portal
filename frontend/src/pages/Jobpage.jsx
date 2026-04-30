import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
// import Jobform from '../components/Jobform';
// import Joblist from '../components/Joblist';
import { Box, Alert,Snackbar } from '@mui/material';

const BASE_URL = 'http://localhost:8000';

const Jobpage = () => {
  const [jobs, setJobs] = useState([]);
  const [toast, setToast] = useState({open:false, msg:"", type:"success"});
  const showToast = (msg, type="success") => setToast({open:true, msg, type});
  const closeToast = ()=> setToast(p=>({...p, open:false}));

  const fetchjobs = async () => {
    try{
      const res = await axios.get(`${BASE_URL}/api/jobs`);
      setJobs(res.data.jobs || []);
    } catch(e) {
      console.error(e);
    }
  };

  //read all jobs
  useEffect(()=> {
    void fetchjobs();
  },[]);

  //add job
  const addjob = async(formdata) => {
    try{
      const res = await axios.post(`${BASE_URL}/api/jobs`, formdata);
      showToast(res.data.msg || "Job added successfully");
      fetchjobs();
      return true;
    } catch(e) {
      console.error(e);
      showToast(e?.response?.data?.msg || "Error adding job", "error");
      return false;
    }
  }

//delete job 
  const deletejob = async (id) => {
    try{
      const res = await axios.delete(`${BASE_URL}/api/jobs/${id}`);
      showToast(res.data.msg || "Job deleted successfully");
      setJobs((prev)=> prev.filter((job)=> job._id !== id));
    } catch(e) {
      showToast(e?.response?.data?.msg || "error deleting job", "error");
    }
  }


  return <>
      <Box>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Job Listings</h1>
          {jobs.length === 0 ? (
            <p>No jobs available.</p>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="rounded border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{job.title}</h2>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                  <button
                    onClick={() => deletejob(job._id)}
                    className="rounded bg-red-600 px-3 py-2 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Snackbar open = {toast.open} autoHideDuration={2000} onClose={closeToast}>
          <Alert onClose={closeToast} severity={toast.type} variant='filled' sx={{width:"100%"}}>
            {toast.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>

}

export default Jobpage


// const StudentProfile = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     bio: '',
//   });

//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState('');
//   const [education, setEducation] = useState([]);
//   const [newEducation, setNewEducation] = useState({ degree: '', field: '', startYear: '', endYear: '' });
//   const [experience, setExperience] = useState([]);
//   const [newExperience, setNewExperience] = useState({ title: '', duration: '' });
//   const [resumeLoading, setResumeLoading] = useState(false);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const clearMessages = () => {
//     setTimeout(() => {
//       setError(null);
//       setSuccess(null);
//     }, 3000);
//   };

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await api.get('/users/profile');
//       setUser(res.data.user);
//       setFormData({
//         name: res.data.user.name || '',
//         email: res.data.user.email || '',
//         bio: res.data.user.profile?.bio || '',
//       });
//       setSkills(res.data.user.profile?.skills || []);
//       setEducation(res.data.user.profile?.education || []);
//       setExperience(res.data.user.profile?.experience || []);
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to load profile';
//       setError(errorMsg);
//       clearMessages();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateProfile = async () => {
//     try {
//       setError(null);
//       if (!formData.name.trim()) {
//         setError('Name is required');
//         return;
//       }

//       const res = await api.put('/users/profile/update', {
//         name: formData.name,
//         bio: formData.bio,
//       });
//       setUser(res.data.user);
//       setSuccess('Profile updated successfully');
//       setIsEditing(false);
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to update profile';
//       setError(errorMsg);
//       clearMessages();
//     }
//   };

//   const addSkill = async () => {
//     if (!skillInput.trim()) {
//       setError('Skill cannot be empty');
//       return;
//     }

//     const skillLower = skillInput.trim().toLowerCase();
//     if (skills.includes(skillLower)) {
//       setError('This skill already exists');
//       return;
//     }

//     const updatedSkills = [...skills, skillLower];
//     try {
//       setError(null);
//       const res = await api.put('/users/profile/skills', { skills: updatedSkills });
//       setSkills(res.data.user.profile?.skills || []);
//       setSkillInput('');
//       setSuccess('Skill added');
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to add skill';
//       setError(errorMsg);
//       clearMessages();
//     }
//   };

//   const removeSkill = async (skillToRemove) => {
//     const updatedSkills = skills.filter(s => s !== skillToRemove);
//     try {
//       setError(null);
//       const res = await api.put('/users/profile/skills', { skills: updatedSkills });
//       setSkills(res.data.user.profile?.skills || []);
//       setSuccess('Skill removed');
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to remove skill';
//       setError(errorMsg);
//       clearMessages();
//     }
//   };

//   const addEducationEntry = async () => {
//     try {
//       setError(null);
//       if (!newEducation.degree.trim() || !newEducation.field.trim()) {
//         setError('Degree and field are required');
//         return;
//       }

//       const res = await api.post('/users/profile/education', { education: newEducation });
//       setEducation(res.data.user.profile?.education || []);
//       setNewEducation({ degree: '', field: '', startYear: '', endYear: '' });
//       setSuccess('Education added');
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to add education';
//       setError(errorMsg);
//       clearMessages();
//     }
//   };

//   const deleteEducationEntry = async (index) => {
//     try {
//       setError(null);
//       const res = await api.delete(`/users/profile/education/${index}`);
//       setEducation(res.data.user.profile?.education || []);
//       setSuccess('Education deleted');
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to delete education';
//       setError(errorMsg);
//       clearMessages();
//     }
//   };

//   const addExperienceEntry = async () => {
//     try {
//       setError(null);
//       if (!newExperience.title.trim()) {
//         setError('Job title is required');
//         return;
//       }

//       const res = await api.post('/users/profile/experience', { experience: newExperience });
//       setExperience(res.data.user.profile?.experience || []);
//       setNewExperience({ title: '', duration: '' });
//       setSuccess('Experience added');
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to add experience';
//       setError(errorMsg);
//       clearMessages();
//     }
//   };

//   const deleteExperienceEntry = async (index) => {
//     try {
//       setError(null);
//       const res = await api.delete(`/users/profile/experience/${index}`);
//       setExperience(res.data.user.profile?.experience || []);
//       setSuccess('Experience deleted');
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to delete experience';
//       setError(errorMsg);
//       clearMessages();
//     }
//   };

//   const handleResumeUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//     if (!validTypes.includes(file.type)) {
//       setError('Please upload a PDF or Word document');
//       clearMessages();
//       return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       setError('File size must be less than 5MB');
//       clearMessages();
//       return;
//     }

//     const formDataUpload = new FormData();
//     formDataUpload.append('resume', file);

//     try {
//       setError(null);
//       setResumeLoading(true);
//       const res = await api.post('/users/profile/resume', formDataUpload, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setUser(res.data.user);
//       setSuccess('Resume uploaded successfully');
//       clearMessages();
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to upload resume';
//       setError(errorMsg);
//       clearMessages();
//     } finally {
//       setResumeLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Layout role="student">
//         <div className="flex justify-center items-center py-20">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading profile...</p>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout role="student">
//       <div className="max-w-4xl mx-auto">
//         {/* Error Alert */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
//             <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Success Alert */}
//         {success && (
//           <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
//             {success}
//           </div>
//         )}

//         {/* Profile Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-xl p-8 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold">{formData.name}</h1>
//               <p className="text-blue-100 mt-2">{formData.email}</p>
//             </div>
//             <button
//               onClick={() => setIsEditing(!isEditing)}
//               className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
//             >
//               {isEditing ? <X size={20} /> : <Edit size={20} />}
//               {isEditing ? 'Cancel' : 'Edit'}
//             </button>
//           </div>
//         </div>

//         {/* Basic Info */}
//         <div className="bg-white border border-gray-200 p-6">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
//             About Me
//           </h2>
//           {isEditing ? (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
//                   placeholder="Your name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Bio</label>
//                 <textarea
//                   value={formData.bio}
//                   onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-24"
//                   placeholder="Tell us about yourself"
//                 />
//               </div>
//               <button
//                 onClick={handleUpdateProfile}
//                 className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//               >
//                 <Save size={18} /> Save Changes
//               </button>
//             </div>
//           ) : (
//             <p className="text-gray-700">{formData.bio || 'No bio added yet'}</p>
//           )}
//         </div>

//         {/* Skills */}
//         <div className="bg-white border border-gray-200 border-t-0 p-6">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <div className="w-1 h-6 bg-green-600 rounded-full"></div>
//             Skills
//           </h2>
//           <div className="flex flex-wrap gap-2 mb-4">
//             {skills.map((skill) => (
//               <div
//                 key={skill}
//                 className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2"
//               >
//                 {skill}
//                 <button
//                   onClick={() => removeSkill(skill)}
//                   className="hover:text-green-900 transition"
//                   title="Remove skill"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={skillInput}
//               onChange={(e) => setSkillInput(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && addSkill()}
//               placeholder="Add a skill and press Enter"
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
//             />
//             <button
//               onClick={addSkill}
//               className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//             >
//               <Plus size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Education */}
//         <div className="bg-white border border-gray-200 border-t-0 p-6">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
//             Education
//           </h2>
//           <div className="space-y-4 mb-6">
//             {education.map((edu, idx) => (
//               <div key={idx} className="bg-purple-50 p-4 rounded-lg border border-purple-200 flex items-start justify-between">
//                 <div>
//                   <p className="font-semibold text-purple-900">{edu.degree} in {edu.field}</p>
//                   <p className="text-sm text-purple-700">{edu.startYear} - {edu.endYear}</p>
//                 </div>
//                 <button
//                   onClick={() => deleteEducationEntry(idx)}
//                   className="text-red-600 hover:text-red-800 transition flex-shrink-0"
//                   title="Delete education"
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-purple-300">
//             <div className="space-y-3">
//               <input
//                 type="text"
//                 value={newEducation.degree}
//                 onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
//                 placeholder="Degree (e.g., Bachelor's, Master's)"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
//               />
//               <input
//                 type="text"
//                 value={newEducation.field}
//                 onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
//                 placeholder="Field of Study"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
//               />
//               <div className="grid grid-cols-2 gap-2">
//                 <input
//                   type="number"
//                   value={newEducation.startYear}
//                   onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
//                   placeholder="Start Year"
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
//                 />
//                 <input
//                   type="number"
//                   value={newEducation.endYear}
//                   onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
//                   placeholder="End Year"
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
//                 />
//               </div>
//               <button
//                 onClick={addEducationEntry}
//                 className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
//               >
//                 <Plus size={18} /> Add Education
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Experience */}
//         <div className="bg-white border border-gray-200 border-t-0 p-6">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
//             Experience
//           </h2>
//           <div className="space-y-4 mb-6">
//             {experience.map((exp, idx) => (
//               <div key={idx} className="bg-orange-50 p-4 rounded-lg border border-orange-200 flex items-start justify-between">
//                 <div>
//                   <p className="font-semibold text-orange-900">{exp.title}</p>
//                   <p className="text-sm text-orange-700">{exp.duration}</p>
//                 </div>
//                 <button
//                   onClick={() => deleteExperienceEntry(idx)}
//                   className="text-red-600 hover:text-red-800 transition flex-shrink-0"
//                   title="Delete experience"
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-orange-300">
//             <div className="space-y-3">
//               <input
//                 type="text"
//                 value={newExperience.title}
//                 onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
//                 placeholder="Job Title"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
//               />
//               <input
//                 type="text"
//                 value={newExperience.duration}
//                 onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
//                 placeholder="Duration (e.g., Jan 2020 - Dec 2021)"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
//               />
//               <button
//                 onClick={addExperienceEntry}
//                 className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
//               >
//                 <Plus size={18} /> Add Experience
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Resume */}
//         <div className="bg-white border border-gray-200 border-t-0 p-6 rounded-b-xl">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <FileText size={24} className="text-red-600" />
//             Resume
//           </h2>
//           {user?.profile?.resume?.fileUrl && (
//             <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
//               <p className="text-sm text-red-700">Current: <span className="font-semibold">{user.profile.resume.fileName}</span></p>
//               <p className="text-xs text-red-600 mt-1">
//                 Uploaded: {user.profile.resume.uploadedAt ? new Date(user.profile.resume.uploadedAt).toLocaleDateString() : 'N/A'}
//               </p>
//             </div>
//           )}
//           <label className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ pointerEvents: resumeLoading ? 'none' : 'auto', opacity: resumeLoading ? 0.6 : 1 }}>
//             {resumeLoading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                 Uploading...
//               </>
//             ) : (
//               <>
//                 <Upload size={18} />
//                 Upload Resume
//               </>
//             )}
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx"
//               onChange={handleResumeUpload}
//               className="hidden"
//               disabled={resumeLoading}
//             />
//           </label>
//           <p className="text-xs text-gray-500 mt-2">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default StudentProfile;














// import React, { useState, useEffect } from 'react';
// import Layout from '../components/Layout';
// import { getUserProfile, updateUserProfile, addSkills, addEducation, addExperience } from '../utils/api';
// import '../styles/Profile.css';

// const StudentProfile = () => {
//   const [user, setUser] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [formData, setFormData] = useState({
//     name: '',
//     bio: '',
//     skills: [],
//   });

//   const [skillInput, setSkillInput] = useState('');
//   const [educationForm, setEducationForm] = useState({
//     degree: '',
//     field: '',
//     startYear: '',
//     endYear: '',
//   });

//   const [experienceForm, setExperienceForm] = useState({
//     title: '',
//     duration: '',
//   });

//   // Fetch user profile on mount
//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const response = await getUserProfile();
//       if (response?.user) {
//         setUser(response.user);
//         setFormData({
//           name: response.user.name,
//           bio: response.user.profile?.bio || '',
//           skills: response.user.profile?.skills || [],
//         });
//       } else {
//         setError(response?.error || 'Failed to load profile');
//       }
//     } catch (err) {
//       setError('Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleAddSkill = () => {
//     if (skillInput.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         skills: [...prev.skills, skillInput.trim()]
//       }));
//       setSkillInput('');
//     }
//   };

//   const handleRemoveSkill = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       skills: prev.skills.filter((_, i) => i !== index)
//     }));
//   };

//   const handleSaveProfile = async () => {
//     try {
//       const response = await updateUserProfile({
//         name: formData.name,
//         profile: {
//           ...user.profile,
//           bio: formData.bio,
//         }
//       });
//       if (response.user) {
//         setUser(response.user);
//         if (formData.skills.length > 0) {
//           await addSkills(formData.skills);
//         }
//         setIsEditing(false);
//         setError(null);
//         alert('Profile updated successfully');
//       }
//     } catch (err) {
//       setError('Failed to update profile');
//     }
//   };

//   const handleAddEducation = async () => {
//     if (!educationForm.degree || !educationForm.field) {
//       setError('Please fill all education fields');
//       return;
//     }
//     try {
//       const response = await addEducation(educationForm);
//       if (response.user) {
//         setUser(response.user);
//         setEducationForm({ degree: '', field: '', startYear: '', endYear: '' });
//         setError(null);
//         alert('Education added successfully');
//       }
//     } catch (err) {
//       setError('Failed to add education');
//     }
//   };

//   const handleAddExperience = async () => {
//     if (!experienceForm.title) {
//       setError('Please fill all experience fields');
//       return;
//     }
//     try {
//       const response = await addExperience(experienceForm);
//       if (response.user) {
//         setUser(response.user);
//         setExperienceForm({ title: '', duration: '' });
//         setError(null);
//         alert('Experience added successfully');
//       }
//     } catch (err) {
//       setError('Failed to add experience');
//     }
//   };

//   if (loading) return <Layout role="student"><div className="loading">Loading profile...</div></Layout>;

//   return (
//     <Layout role="student">
//       <div className="profile-container">
//         <div className="profile-header">
//           <h1>Student Profile</h1>
//           <button
//             className="edit-btn"
//             onClick={() => setIsEditing(!isEditing)}
//           >
//             {isEditing ? 'Cancel' : 'Edit Profile'}
//           </button>
//         </div>

//         {error && <div className="error-message">{error}</div>}

//         {user && (
//           <div className="profile-content">
//             {/* Personal Info Section */}
//             <div className="section">
//               <h2>Personal Information</h2>
//               {isEditing ? (
//                 <div className="form-group">
//                   <label>Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="input-field"
//                   />
//                   <label>Bio</label>
//                   <textarea
//                     name="bio"
//                     value={formData.bio}
//                     onChange={handleInputChange}
//                     className="textarea-field"
//                     rows="4"
//                   />
//                   <button className="save-btn" onClick={handleSaveProfile}>
//                     Save Changes
//                   </button>
//                 </div>
//               ) : (
//                 <div className="info-display">
//                   <p><strong>Name:</strong> {user.name}</p>
//                   <p><strong>Email:</strong> {user.email}</p>
//                   <p><strong>Role:</strong> {user.role}</p>
//                   <p><strong>Bio:</strong> {user.profile?.bio || 'No bio added'}</p>
//                 </div>
//               )}
//             </div>

//             {/* Skills Section */}
//             <div className="section">
//               <h2>Skills</h2>
//               <div className="skills-container">
//                 {formData.skills.length > 0 ? (
//                   formData.skills.map((skill, index) => (
//                     <div key={index} className="skill-tag">
//                       {skill}
//                       {isEditing && (
//                         <button
//                           className="remove-skill"
//                           onClick={() => handleRemoveSkill(index)}
//                         >
//                           ✕
//                         </button>
//                       )}
//                     </div>
//                   ))
//                 ) : (
//                   <p>No skills added</p>
//                 )}
//               </div>
//               {isEditing && (
//                 <div className="add-skill-form">
//                   <input
//                     type="text"
//                     value={skillInput}
//                     onChange={(e) => setSkillInput(e.target.value)}
//                     placeholder="Add a skill"
//                     className="input-field"
//                   />
//                   <button className="add-btn" onClick={handleAddSkill}>
//                     Add Skill
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Education Section */}
//             <div className="section">
//               <h2>Education</h2>
//               <div className="education-list">
//                 {user.profile?.education && user.profile.education.length > 0 ? (
//                   user.profile.education.map((edu, index) => (
//                     <div key={index} className="education-item">
//                       <p><strong>{edu.degree}</strong> in {edu.field}</p>
//                       {edu.startYear && edu.endYear && (
//                         <p className="year-range">
//                           {edu.startYear} - {edu.endYear}
//                         </p>
//                       )}
//                     </div>
//                   ))
//                 ) : (
//                   <p>No education added</p>
//                 )}
//               </div>
//               <div className="add-education-form">
//                 <h3>Add Education</h3>
//                 <input
//                   type="text"
//                   placeholder="Degree (e.g., Bachelor's)"
//                   value={educationForm.degree}
//                   onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
//                   className="input-field"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Field of Study"
//                   value={educationForm.field}
//                   onChange={(e) => setEducationForm({ ...educationForm, field: e.target.value })}
//                   className="input-field"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Start Year"
//                   value={educationForm.startYear}
//                   onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
//                   className="input-field"
//                 />
//                 <input
//                   type="number"
//                   placeholder="End Year"
//                   value={educationForm.endYear}
//                   onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
//                   className="input-field"
//                 />
//                 <button className="add-btn" onClick={handleAddEducation}>
//                   Add Education
//                 </button>
//               </div>
//             </div>

//             {/* Experience Section */}
//             <div className="section">
//               <h2>Experience</h2>
//               <div className="experience-list">
//                 {user.profile?.experience && user.profile.experience.length > 0 ? (
//                   user.profile.experience.map((exp, index) => (
//                     <div key={index} className="experience-item">
//                       <p><strong>{exp.title}</strong></p>
//                       {exp.duration && <p className="duration">{exp.duration}</p>}
//                     </div>
//                   ))
//                 ) : (
//                   <p>No experience added</p>
//                 )}
//               </div>
//               <div className="add-experience-form">
//                 <h3>Add Experience</h3>
//                 <input
//                   type="text"
//                   placeholder="Job Title"
//                   value={experienceForm.title}
//                   onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
//                   className="input-field"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Duration (e.g., 2 years)"
//                   value={experienceForm.duration}
//                   onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
//                   className="input-field"
//                 />
//                 <button className="add-btn" onClick={handleAddExperience}>
//                   Add Experience
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default StudentProfile;



// import React, { useState, useEffect } from "react";
// import Layout from "../components/Layout";
// import {
//   Plus,
//   Briefcase,
//   MapPin,
//   Users,
//   Trash2,
//   ToggleRight,
//   ToggleLeft,
//   Calendar,
//   DollarSign,
//   Clock,
//   Eye,
//   Edit,
//   ExternalLink,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import api from "../utils/api";

// const RecruiterJobs = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deletingId, setDeletingId] = useState(null);
//   const [togglingId, setTogglingId] = useState(null);

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const fetchJobs = async () => {
//     try {
//       const res = await api.get("/jobs/getall");
//       setJobs(res.data.jobs);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteJob = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this job posting?")) {
//       return;
//     }

//     try {
//       setDeletingId(id);
//       await api.delete(`/jobs/delete/${id}`);
//       setJobs(jobs.filter((job) => job._id !== id));
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to delete job");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const toggleActive = async (id) => {
//     try {
//       setTogglingId(id);
//       await api.put(`/jobs/toggle/${id}`);

//       setJobs((prev) =>
//         prev.map((job) =>
//           job._id === id ? { ...job, is_active: !job.is_active } : job,
//         ),
//       );
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setTogglingId(null);
//     }
//   };

//   const getJobTypeColor = (type) => {
//     switch (type?.toLowerCase()) {
//       case "full-time":
//         return "bg-purple-100 text-purple-700";
//       case "part-time":
//         return "bg-orange-100 text-orange-700";
//       case "contract":
//         return "bg-blue-100 text-blue-700";
//       case "internship":
//         return "bg-green-100 text-green-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const formatDate = (date) => {
//     if (!date) return "Recently";
//     const d = new Date(date);
//     const now = new Date();
//     const diffTime = Math.abs(now - d);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays === 1) return "Yesterday";
//     if (diffDays < 7) return `${diffDays} days ago`;
//     if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
//     return d.toLocaleDateString();
//   };

//   return (
//     <Layout role="recruiter">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
//         >
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
//               Job Postings
//             </h1>
//             <p className="text-gray-500 text-lg mt-2">
//               Manage and track all your job listings
//             </p>
//           </div>
//           <Link to="/recruiter/post-job">
//             <button className="flex items-center gap-2 bg-gradient-to-r from-[#08c7f7] to-[#0284c7] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#08c7f7]/50">
//               <Plus className="h-4 w-4" />
//               Post New Job
//             </button>
//           </Link>
//         </motion.div>

//         {/* Stats Summary */}
//         {!loading && jobs.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
//           >
//             <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-blue-600 text-sm font-medium">
//                     Total Jobs
//                   </p>
//                   <p className="text-2xl font-bold text-blue-900">
//                     {jobs.length}
//                   </p>
//                 </div>
//                 <Briefcase className="h-8 w-8 text-blue-500 opacity-50" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-green-600 text-sm font-medium">
//                     Active Jobs
//                   </p>
//                   <p className="text-2xl font-bold text-green-900">
//                     {jobs.filter((j) => j.is_active).length}
//                   </p>
//                 </div>
//                 <ToggleRight className="h-8 w-8 text-green-500 opacity-50" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-purple-600 text-sm font-medium">
//                     Total Applications
//                   </p>
//                   <p className="text-2xl font-bold text-purple-900">
//                     {jobs.reduce(
//                       (sum, job) => sum + (job.application?.length || 0),
//                       0,
//                     )}
//                   </p>
//                 </div>
//                 <Users className="h-8 w-8 text-purple-500 opacity-50" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-orange-600 text-sm font-medium">
//                     Avg. per Job
//                   </p>
//                   <p className="text-2xl font-bold text-orange-900">
//                     {(
//                       jobs.reduce(
//                         (sum, job) => sum + (job.application?.length || 0),
//                         0,
//                       ) / jobs.length || 0
//                     ).toFixed(1)}
//                   </p>
//                 </div>
//                 <Eye className="h-8 w-8 text-orange-500 opacity-50" />
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Loading State */}
//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#08c7f7] mx-auto mb-4"></div>
//               <p className="text-gray-600">Loading your jobs...</p>
//             </div>
//           </div>
//         ) : jobs.length === 0 ? (
//           // Empty State
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center py-20 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
//           >
//             <div className="bg-white rounded-full p-4 mb-4 shadow-sm">
//               <Briefcase className="h-12 w-12 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               No jobs posted yet
//             </h3>
//             <p className="text-gray-500 mb-6">
//               Get started by posting your first job opening
//             </p>
//             <Link to="/recruiter/post-job">
//               <button className="flex items-center gap-2 bg-gradient-to-r from-[#08c7f7] to-[#0284c7] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
//                 <Plus className="h-4 w-4" />
//                 Post Your First Job
//               </button>
//             </Link>
//           </motion.div>
//         ) : (
//           // Job Cards Grid
//           <div className="grid gap-6">
//             {jobs.map((job, i) => (
//               <motion.div
//                 key={job._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: i * 0.05 }}
//                 className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
//                   job.is_active
//                     ? "border-green-200 hover:border-green-300"
//                     : "border-gray-200 hover:border-gray-300 opacity-75"
//                 }`}
//               >
//                 {/* Status Badge - Top Right Corner */}
//                 <div className="absolute top-4 right-4 flex gap-2">
//                   {togglingId === job._id ? (
//                     <div className="px-3 py-1 bg-gray-100 rounded-full">
//                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
//                     </div>
//                   ) : (
//                     <span
//                       className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
//                         job.is_active
//                           ? "bg-green-500 text-white"
//                           : "bg-gray-400 text-white"
//                       }`}
//                     >
//                       {job.is_active ? "● ACTIVE" : "○ INACTIVE"}
//                     </span>
//                   )}
//                 </div>

//                 <div className="p-6 pr-24">
//                   <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
//                     {/* Left Content */}
//                     <div className="flex-1">
//                       {/* Title and Company */}
//                       <div className="mb-3">
//                         <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#08c7f7] transition-colors">
//                           {job.title}
//                         </h3>
//                         <p className="text-gray-600 font-medium">
//                           {job.company?.name}
//                         </p>
//                       </div>

//                       {/* Job Details Grid */}
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <MapPin
//                             size={16}
//                             className="text-gray-400 flex-shrink-0"
//                           />
//                           <span>{job.location || "Remote"}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Users
//                             size={16}
//                             className="text-gray-400 flex-shrink-0"
//                           />
//                           <span>
//                             <span className="font-semibold text-gray-900">
//                               {job.application?.length || 0}
//                             </span>{" "}
//                             applications
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Clock
//                             size={16}
//                             className="text-gray-400 flex-shrink-0"
//                           />
//                           <span>Posted {formatDate(job.createdAt)}</span>
//                         </div>
//                         {job.salary && (
//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <DollarSign
//                               size={16}
//                               className="text-gray-400 flex-shrink-0"
//                             />
//                             <span>{job.salary}</span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Job Type Badge */}
//                       <div className="mb-4">
//                         <span
//                           className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${getJobTypeColor(
//                             job.jobType,
//                           )}`}
//                         >
//                           <Briefcase size={12} />
//                           {job.jobType || "Full-Time"}
//                         </span>
//                       </div>

//                       {/* Skills */}
//                       {job.skillsrequired && job.skillsrequired.length > 0 && (
//                         <div className="flex flex-wrap gap-2">
//                           {job.skillsrequired.slice(0, 5).map((skill, idx) => (
//                             <span
//                               key={idx}
//                               className="bg-gradient-to-r from-gray-100 to-gray-50 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 border border-gray-200"
//                             >
//                               {skill}
//                             </span>
//                           ))}
//                           {job.skillsrequired.length > 5 && (
//                             <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600">
//                               +{job.skillsrequired.length - 5} more
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex flex-row lg:flex-col gap-2">
//                       {/* View Applications Button */}
//                       <Link to={`/recruiter/applications/${job._id}`}>
//                         <button
//                           className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all duration-200 text-sm font-medium w-full lg:w-auto"
//                           title="View Applications"
//                         >
//                           <Eye size={16} />
//                           <span className="hidden sm:inline">View Apps</span>
//                         </button>
//                       </Link>

//                       {/* Edit Button */}
//                       <Link to={`/recruiter/edit-job/${job._id}`}>
//                         <button
//                           className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 text-sm font-medium w-full lg:w-auto"
//                           title="Edit Job"
//                         >
//                           <Edit size={16} />
//                           <span className="hidden sm:inline">Edit</span>
//                         </button>
//                       </Link>

//                       {/* Toggle Active/Inactive */}
//                       <button
//                         onClick={() => toggleActive(job._id)}
//                         disabled={togglingId === job._id}
//                         className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium w-full lg:w-auto ${
//                           job.is_active
//                             ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
//                             : "bg-green-50 text-green-700 hover:bg-green-100"
//                         } ${togglingId === job._id ? "opacity-50 cursor-not-allowed" : ""}`}
//                         title={
//                           job.is_active ? "Deactivate Job" : "Activate Job"
//                         }
//                       >
//                         {togglingId === job._id ? (
//                           <>
//                             <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
//                             <span>Updating...</span>
//                           </>
//                         ) : (
//                           <>
//                             {job.is_active ? (
//                               <ToggleLeft size={16} />
//                             ) : (
//                               <ToggleRight size={16} />
//                             )}
//                             <span>
//                               {job.is_active ? "Deactivate" : "Activate"}
//                             </span>
//                           </>
//                         )}
//                       </button>

//                       {/* Delete Button */}
//                       <button
//                         onClick={() => deleteJob(job._id)}
//                         disabled={deletingId === job._id}
//                         className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-200 text-sm font-medium w-full lg:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
//                         title="Delete Job"
//                       >
//                         {deletingId === job._id ? (
//                           <>
//                             <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
//                             <span>Deleting...</span>
//                           </>
//                         ) : (
//                           <>
//                             <Trash2 size={16} />
//                             <span>Delete</span>
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default RecruiterJobs;
