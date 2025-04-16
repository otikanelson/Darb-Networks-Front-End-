// src/components/steps/TeamStep.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Linkedin, Mail, Twitter, AlertTriangle } from 'lucide-react';

const TeamStep = ({ formData, setFormData, onNext, onPrev, newItemRef, setGlobalError, bottomRef }) => {
  const [errors, setErrors] = useState({});
  const [newMemberId, setNewMemberId] = useState(null);

  // Reset new member ID after it's been referenced
  useEffect(() => {
    if (newMemberId) {
      const timer = setTimeout(() => {
        setNewMemberId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newMemberId]);

  const addTeamMember = () => {
    const newId = Date.now();
    setNewMemberId(newId);
    
    setFormData(prev => ({
      ...prev,
      team: [
        ...(prev.team || []),
        {
          id: newId,
          name: '',
          role: '',
          bio: '',
          experience: '',
          linkedIn: '',
          twitter: '',
          email: '',
          image: null
        }
      ]
    }));
  };

  const removeTeamMember = (id) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(member => member.id !== id)
    }));
  };

  const updateTeamMember = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    }));

    // Clear error when field is modified
    if (errors[`team_${id}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`team_${id}_${field}`];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({
          ...prev,
          [`team_${id}_image`]: 'Image must be less than 2MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updateTeamMember(id, 'image', {
          file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTeam = () => {
    const newErrors = {};
    
    if (!formData.team?.length) {
      newErrors.team = 'At least one team member is required';
      setErrors(newErrors);
      return false;
    }

    let isValid = true;
    formData.team.forEach(member => {
      if (!member.name.trim()) {
        newErrors[`team_${member.id}_name`] = 'Name is required';
        isValid = false;
      }
      if (!member.role.trim()) {
        newErrors[`team_${member.id}_role`] = 'Role is required';
        isValid = false;
      }
      if (!member.bio.trim()) {
        newErrors[`team_${member.id}_bio`] = 'Bio is required';
        isValid = false;
      }
      if (member.linkedIn && !member.linkedIn.includes('linkedin.com')) {
        newErrors[`team_${member.id}_linkedIn`] = 'Invalid LinkedIn URL';
        isValid = false;
      }
      if (member.twitter && !member.twitter.includes('twitter.com')) {
        newErrors[`team_${member.id}_twitter`] = 'Invalid Twitter URL';
        isValid = false;
      }
      if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        newErrors[`team_${member.id}_email`] = 'Invalid email address';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateTeam()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Team Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Team Members</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add key team members and their roles in the project
            </p>
          </div>
          <button
            type="button"
            onClick={addTeamMember}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md 
                     shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </button>
        </div>

        {errors.team && (
          <p className="text-sm text-red-500 mt-2">{errors.team}</p>
        )}

        {/* Show guidance when adding a new team member */}
        {newMemberId && formData.team?.length > 0 && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center space-x-2 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-purple-700">New team member added! Scroll down to fill in the details.</p>
          </div>
        )}

        <div className="space-y-6">
          {formData.team?.map((member) => (
            <div 
              key={member.id} 
              className={`border border-gray-200 rounded-lg p-6 space-y-6 ${member.id === newMemberId ? 'ring-2 ring-purple-500' : ''}`}
              ref={member.id === newMemberId ? newItemRef : null}
            >
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium text-gray-900">
                  {member.name || 'New Team Member'}
                </h4>
                <button
                  type="button"
                  onClick={() => removeTeamMember(member.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                      className={`mt-1 block w-full rounded-md border
                        ${errors[`team_${member.id}_name`] ? 'border-red-500' : 'border-gray-300'}
                        focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring
                        focus:ring-opacity-50`}
                    />
                    {errors[`team_${member.id}_name`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`team_${member.id}_name`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                      className={`mt-1 block w-full rounded-md border
                        ${errors[`team_${member.id}_role`] ? 'border-red-500' : 'border-gray-300'}
                        focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50`}
                      placeholder="e.g., CEO, CTO, Lead Developer"
                    />
                    {errors[`team_${member.id}_role`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`team_${member.id}_role`]}</p>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {member.image ? (
                        <img
                          src={member.image.preview}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 uppercase">
                          {member.name ? member.name.charAt(0) : '?'}
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-3 py-2 border border-gray-300 
                                   shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 
                                   bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
                                   focus:ring-offset-2 focus:ring-purple-500">
                        Change
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(member.id, e)}
                      />
                    </label>
                  </div>
                  {errors[`team_${member.id}_image`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`team_${member.id}_image`]}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={member.bio}
                    onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)}
                    rows={3}
                    className={`mt-1 block w-full rounded-md border
                      ${errors[`team_${member.id}_bio`] ? 'border-red-500' : 'border-gray-300'}
                      focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50`}
                    placeholder="Brief professional background and achievements"
                  />
                  {errors[`team_${member.id}_bio`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`team_${member.id}_bio`]}</p>
                  )}
                </div>

                {/* Social Links */}
                <div className="col-span-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Linkedin className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={member.linkedIn}
                          onChange={(e) => updateTeamMember(member.id, 'linkedIn', e.target.value)}
                          className={`pl-10 block w-full rounded-md border
                            ${errors[`team_${member.id}_linkedIn`] ? 'border-red-500' : 'border-gray-300'}
                            focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50`}
                          placeholder="LinkedIn URL"
                        />
                      </div>
                      {errors[`team_${member.id}_linkedIn`] && (
                        <p className="mt-1 text-sm text-red-500">{errors[`team_${member.id}_linkedIn`]}</p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Twitter</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Twitter className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={member.twitter}
                          onChange={(e) => updateTeamMember(member.id, 'twitter', e.target.value)}
                          className={`pl-10 block w-full rounded-md border
                            ${errors[`team_${member.id}_twitter`] ? 'border-red-500' : 'border-gray-300'}
                            focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50`}
                          placeholder="Twitter URL"
                        />
                      </div>
                      {errors[`team_${member.id}_twitter`] && (
                        <p className="mt-1 text-sm text-red-500">{errors[`team_${member.id}_twitter`]}</p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                          className={`pl-10 block w-full rounded-md border
                            ${errors[`team_${member.id}_email`] ? 'border-red-500' : 'border-gray-300'}
                            focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50`}
                          placeholder="Email address"
                        />
                      </div>
                      {errors[`team_${member.id}_email`] && (
                        <p className="mt-1 text-sm text-red-500">{errors[`team_${member.id}_email`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm 
                  font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm 
                  font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TeamStep;