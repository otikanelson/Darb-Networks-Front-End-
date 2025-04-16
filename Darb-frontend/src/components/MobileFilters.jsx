// MobileFilters.jsx - Add this as a new component
import React, { useState } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';

const MobileFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  stageFilterOptions,
  selectedStage,
  setSelectedStage,
  statusFilterOptions,
  selectedFilter,
  setSelectedFilter,
  sortOptions,
  sortBy,
  setSortBy
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  // Local state to hold changes until applied
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempStage, setTempStage] = useState(selectedStage);
  const [tempStatus, setTempStatus] = useState(selectedFilter);
  const [tempSort, setTempSort] = useState(sortBy);
  
  // Apply filters and close drawer
  const applyFilters = () => {
    setSelectedCategory(tempCategory);
    setSelectedStage(tempStage);
    setSelectedFilter(tempStatus);
    setSortBy(tempSort);
    setIsOpen(false);
  };
  
  // Reset filters to current applied values
  const resetTempFilters = () => {
    setTempCategory(selectedCategory);
    setTempStage(selectedStage);
    setTempStatus(selectedFilter);
    setTempSort(sortBy);
  };
  
  // Reset all filters to default
  const clearAllFilters = () => {
    setTempCategory("All Categories");
    setTempStage("");
    setTempStatus("All Campaigns");
    setTempSort("Date Posted");
  };
  
  // Toggle a section open/closed
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };
  
  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => {
          setIsOpen(true);
          resetTempFilters();
        }}
        className="md:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </button>
      
      {/* Mobile filter drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* Filter options */}
                    <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
                      {/* Categories */}
                      <div className="border-b border-gray-200 pb-4">
                        <button
                          className="flex w-full items-center justify-between text-lg font-medium text-gray-900"
                          onClick={() => toggleSection('categories')}
                        >
                          <span>Categories</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${activeSection === 'categories' ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {activeSection === 'categories' && (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center">
                              <input
                                id="category-all"
                                type="radio"
                                name="category"
                                checked={tempCategory === "All Categories"}
                                onChange={() => setTempCategory("All Categories")}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                              />
                              <label htmlFor="category-all" className="ml-3 text-sm text-gray-700">
                                All Categories
                              </label>
                            </div>
                            
                            {Object.entries(categories).map(([group, subcategories]) => (
                              <div key={group} className="space-y-3">
                                <div className="flex items-center">
                                  <input
                                    id={`category-${group}`}
                                    type="radio"
                                    name="category"
                                    checked={tempCategory === group}
                                    onChange={() => setTempCategory(group)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                  />
                                  <label htmlFor={`category-${group}`} className="ml-3 text-sm font-medium text-gray-900">
                                    {group}
                                  </label>
                                </div>
                                
                                {subcategories.map((category) => (
                                  <div key={category} className="flex items-center ml-6">
                                    <input
                                      id={`category-${category}`}
                                      type="radio"
                                      name="category"
                                      checked={tempCategory === category}
                                      onChange={() => setTempCategory(category)}
                                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <label htmlFor={`category-${category}`} className="ml-3 text-sm text-gray-700">
                                      {category}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Development Stage */}
                      <div className="border-b border-gray-200 pb-4">
                        <button
                          className="flex w-full items-center justify-between text-lg font-medium text-gray-900"
                          onClick={() => toggleSection('stages')}
                        >
                          <span>Development Stage</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${activeSection === 'stages' ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {activeSection === 'stages' && (
                          <div className="mt-3 space-y-3">
                            {stageFilterOptions.map((option) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  id={`stage-${option.value}`}
                                  type="radio"
                                  name="stage"
                                  checked={tempStage === option.value}
                                  onChange={() => setTempStage(option.value)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <label htmlFor={`stage-${option.value}`} className="ml-3 text-sm text-gray-700">
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Status */}
                      <div className="border-b border-gray-200 pb-4">
                        <button
                          className="flex w-full items-center justify-between text-lg font-medium text-gray-900"
                          onClick={() => toggleSection('status')}
                        >
                          <span>Campaign Status</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${activeSection === 'status' ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {activeSection === 'status' && (
                          <div className="mt-3 space-y-3">
                            {statusFilterOptions.map((option) => (
                              <div key={option.id} className="flex items-center">
                                <input
                                  id={`status-${option.id}`}
                                  type="radio"
                                  name="status"
                                  checked={tempStatus === option.label}
                                  onChange={() => setTempStatus(option.label)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <label htmlFor={`status-${option.id}`} className="ml-3 text-sm text-gray-700">
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Sort */}
                      <div className="border-b border-gray-200 pb-4">
                        <button
                          className="flex w-full items-center justify-between text-lg font-medium text-gray-900"
                          onClick={() => toggleSection('sort')}
                        >
                          <span>Sort By</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${activeSection === 'sort' ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {activeSection === 'sort' && (
                          <div className="mt-3 space-y-3">
                            {["Date Posted", "Most Funded", "End Date"].map((option) => (
                              <div key={option} className="flex items-center">
                                <input
                                  id={`sort-${option}`}
                                  type="radio"
                                  name="sort"
                                  checked={tempSort === option}
                                  onChange={() => setTempSort(option)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <label htmlFor={`sort-${option}`} className="ml-3 text-sm text-gray-700">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="border-t border-gray-200 px-4 py-3 flex justify-between">
                      <button
                        type="button"
                        className="text-sm font-medium text-gray-600 hover:text-gray-800"
                        onClick={clearAllFilters}
                      >
                        Clear all
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-800"
                        onClick={applyFilters}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilters;