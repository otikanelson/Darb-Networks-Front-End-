// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import DashboardNavbar from '../components/Navbars/DashboardNavbar';
import Footer from '../components/layout/Footer';

const AdminPanel = () => {
  const [founderRequests, setFounderRequests] = useState([
    { 
      id: 1, 
      name: 'John Smith', 
      email: 'john@example.com', 
      companyName: 'Tech Innovations', 
      requestDate: 'March 10, 2025, 14:22 p.m.',
      status: 'pending'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      email: 'sarah@example.com', 
      companyName: 'Green Solutions', 
      requestDate: 'March 9, 2025, 10:15 a.m.',
      status: 'pending'
    },
    { 
      id: 3, 
      name: 'Michael Brown', 
      email: 'michael@example.com', 
      companyName: 'Finance Tech', 
      requestDate: 'March 8, 2025, 09:30 a.m.',
      status: 'pending'
    },
  ]);

  const [campaignRequests, setCampaignRequests] = useState([
    { 
      id: 1, 
      title: 'EcoInvest', 
      founder: 'David Wilson', 
      goalAmount: 50000.00, 
      category: 'Green Energy',
      submittedDate: 'March 11, 2025, 11:45 a.m.',
      status: 'pending'
    },
    { 
      id: 2, 
      title: 'HealthTech Pro', 
      founder: 'Lisa Chen', 
      goalAmount: 75000.00, 
      category: 'Healthcare',
      submittedDate: 'March 10, 2025, 15:20 p.m.',
      status: 'pending'
    },
    { 
      id: 3, 
      title: 'EduLearn Platform', 
      founder: 'Robert Jones', 
      goalAmount: 35000.00, 
      category: 'Education',
      submittedDate: 'March 9, 2025, 14:10 p.m.',
      status: 'pending'
    },
  ]);

  const [selectedFounderRequests, setSelectedFounderRequests] = useState([]);
  const [selectedCampaignRequests, setSelectedCampaignRequests] = useState([]);
  const [founderFilter, setFounderFilter] = useState('pending');
  const [campaignFilter, setCampaignFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('founderRequests');

  const handleFounderSelection = (id) => {
    if (selectedFounderRequests.includes(id)) {
      setSelectedFounderRequests(selectedFounderRequests.filter(item => item !== id));
    } else {
      setSelectedFounderRequests([...selectedFounderRequests, id]);
    }
  };

  const handleCampaignSelection = (id) => {
    if (selectedCampaignRequests.includes(id)) {
      setSelectedCampaignRequests(selectedCampaignRequests.filter(item => item !== id));
    } else {
      setSelectedCampaignRequests([...selectedCampaignRequests, id]);
    }
  };

  const approveFounderRequests = () => {
    const updatedRequests = founderRequests.map(request => {
      if (selectedFounderRequests.includes(request.id)) {
        return { ...request, status: 'approved' };
      }
      return request;
    });
    setFounderRequests(updatedRequests);
    setSelectedFounderRequests([]);
  };

  const rejectFounderRequests = () => {
    const updatedRequests = founderRequests.map(request => {
      if (selectedFounderRequests.includes(request.id)) {
        return { ...request, status: 'rejected' };
      }
      return request;
    });
    setFounderRequests(updatedRequests);
    setSelectedFounderRequests([]);
  };

  const approveCampaignRequests = () => {
    const updatedRequests = campaignRequests.map(request => {
      if (selectedCampaignRequests.includes(request.id)) {
        return { ...request, status: 'approved' };
      }
      return request;
    });
    setCampaignRequests(updatedRequests);
    setSelectedCampaignRequests([]);
  };

  const rejectCampaignRequests = () => {
    const updatedRequests = campaignRequests.map(request => {
      if (selectedCampaignRequests.includes(request.id)) {
        return { ...request, status: 'rejected' };
      }
      return request;
    });
    setCampaignRequests(updatedRequests);
    setSelectedCampaignRequests([]);
  };

  // Filter requests based on the selected filter
  const filteredFounderRequests = founderFilter === 'all' 
    ? founderRequests 
    : founderRequests.filter(request => request.status === founderFilter);

  const filteredCampaignRequests = campaignFilter === 'all' 
    ? campaignRequests 
    : campaignRequests.filter(request => request.status === campaignFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Admin Panel Header */}
          <div className="bg-green-700 text-white p-6">
            <h1 className="text-3xl font-bold">DARB ADMINISTRATION 😍 🔥 🚀</h1>
            <p className="text-green-100 mt-2">Manage founder and campaign requests</p>
          </div>
          
          {/* Custom Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'founderRequests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('founderRequests')}
              >
                Founder Requests
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'campaignRequests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('campaignRequests')}
              >
                Campaign Requests
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'founderRequests' ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Select requests to approve</h2>
                  <div className="flex space-x-2">
                    <select 
                      value={founderFilter}
                      onChange={(e) => setFounderFilter(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All requests</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center mb-4">
                  <div className="mr-2">
                    Action:
                  </div>
                  <button 
                    onClick={approveFounderRequests}
                    disabled={selectedFounderRequests.length === 0}
                    className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button 
                    onClick={rejectFounderRequests}
                    disabled={selectedFounderRequests.length === 0}
                    className="ml-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                  <div className="ml-4 text-gray-600">
                    {selectedFounderRequests.length} of {filteredFounderRequests.length} selected
                  </div>
                </div>
                
                {/* Founder Requests Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          <input 
                            type="checkbox" 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFounderRequests(filteredFounderRequests.map(request => request.id));
                              } else {
                                setSelectedFounderRequests([]);
                              }
                            }}
                            checked={selectedFounderRequests.length === filteredFounderRequests.length && filteredFounderRequests.length > 0}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Company
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Request Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFounderRequests.map((request) => (
                        <tr key={request.id} className={request.status === 'approved' ? 'bg-green-50' : request.status === 'rejected' ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              checked={selectedFounderRequests.includes(request.id)}
                              onChange={() => handleFounderSelection(request.id)}
                              disabled={request.status !== 'pending'}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.companyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.requestDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                              <Eye className="h-5 w-5" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => {
                                    const updatedRequests = founderRequests.map(r => 
                                      r.id === request.id ? { ...r, status: 'approved' } : r
                                    );
                                    setFounderRequests(updatedRequests);
                                  }}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    const updatedRequests = founderRequests.map(r => 
                                      r.id === request.id ? { ...r, status: 'rejected' } : r
                                    );
                                    setFounderRequests(updatedRequests);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredFounderRequests.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No founder requests found matching the current filter.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Select campaigns to approve</h2>
                  <div className="flex space-x-2">
                    <select 
                      value={campaignFilter}
                      onChange={(e) => setCampaignFilter(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All campaigns</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center mb-4">
                  <div className="mr-2">
                    Action:
                  </div>
                  <button 
                    onClick={approveCampaignRequests}
                    disabled={selectedCampaignRequests.length === 0}
                    className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button 
                    onClick={rejectCampaignRequests}
                    disabled={selectedCampaignRequests.length === 0}
                    className="ml-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                  <div className="ml-4 text-gray-600">
                    {selectedCampaignRequests.length} of {filteredCampaignRequests.length} selected
                  </div>
                </div>
                
                {/* Campaign Requests Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          <input 
                            type="checkbox" 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCampaignRequests(filteredCampaignRequests.map(request => request.id));
                              } else {
                                setSelectedCampaignRequests([]);
                              }
                            }}
                            checked={selectedCampaignRequests.length === filteredCampaignRequests.length && filteredCampaignRequests.length > 0}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Founder
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Goal Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Submitted Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCampaignRequests.map((request) => (
                        <tr key={request.id} className={request.status === 'approved' ? 'bg-green-50' : request.status === 'rejected' ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              checked={selectedCampaignRequests.includes(request.id)}
                              onChange={() => handleCampaignSelection(request.id)}
                              disabled={request.status !== 'pending'}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.founder}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${request.goalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.submittedDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => {
                                // In a real implementation, this would navigate to campaign details
                                console.log(`View campaign ${request.id}`);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => {
                                    const updatedRequests = campaignRequests.map(r => 
                                      r.id === request.id ? { ...r, status: 'approved' } : r
                                    );
                                    setCampaignRequests(updatedRequests);
                                  }}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    const updatedRequests = campaignRequests.map(r => 
                                      r.id === request.id ? { ...r, status: 'rejected' } : r
                                    );
                                    setCampaignRequests(updatedRequests);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredCampaignRequests.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No campaign requests found matching the current filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;