import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminEventService } from '../../services/eventService';

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    title: '',
    edition: 'Edition 1',
    tagline: '',
    description: '',
    bannerImage: '',
    brochureUrl: '',
    startDate: '',
    endDate: '',
    venue: {
      name: '',
      address: '',
      mapLink: ''
    },
    ticketPrice: 0,
    currency: 'INR',
    aboutEvent: '',
    aboutOrganizers: '',
    highlights: [],
    schedule: [],
    organizers: [],
    celebrityGuests: [],
    stallsAvailable: false,
    stallInfo: {
      totalStalls: 0,
      bookedStalls: 0,
      stallTypes: []
    },
    contactInfo: [],
    rulesGuidelines: [],
    paymentInfo: {
      accountHolder: '',
      upiId: '',
      qrCodeUrl: ''
    },
    status: 'draft',
    featured: false,
    metaDescription: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await adminEventService.getEventById(id);
      const event = response.data;

      // Format dates for input fields
      setFormData({
        ...event,
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Failed to load event details');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      if (isEdit) {
        await adminEventService.updateEvent(id, submitData);
        alert('Event updated successfully!');
      } else {
        await adminEventService.createEvent(submitData);
        alert('Event created successfully!');
      }

      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addArrayItem = (field, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem]
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: 'fi-rr-info' },
    { id: 'content', label: 'Content', icon: 'fi-rr-document' },
    { id: 'schedule', label: 'Schedule', icon: 'fi-rr-calendar' },
    { id: 'highlights', label: 'Highlights', icon: 'fi-rr-star' },
    { id: 'stalls', label: 'Stalls', icon: 'fi-rr-shop' },
    { id: 'contacts', label: 'Contacts', icon: 'fi-rr-phone-call' },
    { id: 'settings', label: 'Settings', icon: 'fi-rr-settings' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update event details and settings' : 'Fill in the event information'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/events')}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <i className="fi fi-rr-arrow-left mr-2"></i>
          Back to Events
        </button>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex gap-2 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-green-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className={`fi ${section.icon}`}></i>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="Padharo Mhare Fest"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Edition
                  </label>
                  <input
                    type="text"
                    value={formData.edition}
                    onChange={(e) => updateField('edition', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="Edition 1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="Where Jaipur's soul meets coffee, vibrant stalls, and free-spirited vibe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="Brief description of the event..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue.name}
                  onChange={(e) => updateNestedField('venue', 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="Aangan Cafe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Venue Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.venue.address}
                  onChange={(e) => updateNestedField('venue', 'address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="Full address..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Maps Link
                </label>
                <input
                  type="url"
                  value={formData.venue.mapLink}
                  onChange={(e) => updateNestedField('venue', 'mapLink', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.bannerImage}
                    onChange={(e) => updateField('bannerImage', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brochure PDF URL
                  </label>
                  <input
                    type="url"
                    value={formData.brochureUrl}
                    onChange={(e) => updateField('brochureUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Content Section */}
          {activeSection === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  About the Event *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.aboutEvent}
                  onChange={(e) => updateField('aboutEvent', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="Detailed description of the event..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  About the Organizers
                </label>
                <textarea
                  rows={6}
                  value={formData.aboutOrganizers}
                  onChange={(e) => updateField('aboutOrganizers', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="Information about organizing team..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rules & Guidelines
                </label>
                {formData.rulesGuidelines.map((rule, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateArrayItem('rulesGuidelines', index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Rule..."
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('rulesGuidelines', index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('rulesGuidelines', '')}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  <i className="fi fi-rr-plus mr-2"></i>
                  Add Rule
                </button>
              </div>
            </motion.div>
          )}

          {/* Schedule Section */}
          {activeSection === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Event Schedule</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('schedule', {
                    day: formData.schedule.length + 1,
                    date: '',
                    scheduleItems: []
                  })}
                  className="px-4 py-2 bg-green-900 text-white rounded-xl hover:bg-green-800"
                >
                  <i className="fi fi-rr-plus mr-2"></i>
                  Add Day
                </button>
              </div>

              {formData.schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg">Day {day.day}</h4>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('schedule', dayIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={day.date}
                    onChange={(e) => updateArrayItem('schedule', dayIndex, { ...day, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="17 January 2026"
                  />

                  {day.scheduleItems?.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => {
                            const newItems = [...day.scheduleItems];
                            newItems[itemIndex] = { ...item, time: e.target.value };
                            updateArrayItem('schedule', dayIndex, { ...day, scheduleItems: newItems });
                          }}
                          className="w-1/3 px-4 py-2 border border-gray-300 rounded-xl"
                          placeholder="11:00 AM"
                        />
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...day.scheduleItems];
                            newItems[itemIndex] = { ...item, title: e.target.value };
                            updateArrayItem('schedule', dayIndex, { ...day, scheduleItems: newItems });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl"
                          placeholder="Activity title"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = day.scheduleItems.filter((_, i) => i !== itemIndex);
                            updateArrayItem('schedule', dayIndex, { ...day, scheduleItems: newItems });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <i className="fi fi-rr-trash"></i>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => {
                          const newItems = [...day.scheduleItems];
                          newItems[itemIndex] = { ...item, description: e.target.value };
                          updateArrayItem('schedule', dayIndex, { ...day, scheduleItems: newItems });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                        placeholder="Description (optional)"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...(day.scheduleItems || []), { time: '', title: '', description: '' }];
                      updateArrayItem('schedule', dayIndex, { ...day, scheduleItems: newItems });
                    }}
                    className="w-full py-2 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 text-gray-600"
                  >
                    <i className="fi fi-rr-plus mr-2"></i>
                    Add Schedule Item
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* Highlights Section */}
          {activeSection === 'highlights' && (
            <motion.div
              key="highlights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Key Highlights</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('highlights', { title: '', description: '' })}
                  className="px-4 py-2 bg-green-900 text-white rounded-xl hover:bg-green-800"
                >
                  <i className="fi fi-rr-plus mr-2"></i>
                  Add Highlight
                </button>
              </div>

              {formData.highlights.map((highlight, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <input
                      type="text"
                      value={highlight.title}
                      onChange={(e) => updateArrayItem('highlights', index, { ...highlight, title: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Highlight title"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('highlights', index)}
                      className="ml-2 p-3 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={highlight.description}
                    onChange={(e) => updateArrayItem('highlights', index, { ...highlight, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="Highlight description"
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* Stalls Section */}
          {activeSection === 'stalls' && (
            <motion.div
              key="stalls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="stallsAvailable"
                  checked={formData.stallsAvailable}
                  onChange={(e) => updateField('stallsAvailable', e.target.checked)}
                  className="w-5 h-5 text-green-900 rounded"
                />
                <label htmlFor="stallsAvailable" className="text-lg font-semibold text-gray-900">
                  Stall Booking Available
                </label>
              </div>

              {formData.stallsAvailable && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Stalls
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stallInfo.totalStalls}
                        onChange={(e) => updateNestedField('stallInfo', 'totalStalls', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment UPI ID
                      </label>
                      <input
                        type="text"
                        value={formData.paymentInfo.upiId}
                        onChange={(e) => updateNestedField('paymentInfo', 'upiId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                        placeholder="merchant@upi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.paymentInfo.accountHolder}
                      onChange={(e) => updateNestedField('paymentInfo', 'accountHolder', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Zenzaawara AI Travel Private Limited"
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Contacts Section */}
          {activeSection === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('contactInfo', { name: '', role: '', phone: '', email: '' })}
                  className="px-4 py-2 bg-green-900 text-white rounded-xl hover:bg-green-800"
                >
                  <i className="fi fi-rr-plus mr-2"></i>
                  Add Contact
                </button>
              </div>

              {formData.contactInfo.map((contact, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-gray-900">Contact {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('contactInfo', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateArrayItem('contactInfo', index, { ...contact, name: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={contact.role}
                      onChange={(e) => updateArrayItem('contactInfo', index, { ...contact, role: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Role"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateArrayItem('contactInfo', index, { ...contact, phone: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Phone"
                    />
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateArrayItem('contactInfo', index, { ...contact, email: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Email"
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="w-5 h-5 text-green-900 rounded"
                />
                <label htmlFor="featured" className="text-lg font-semibold text-gray-900">
                  Featured Event
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="Short description for search engines..."
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-4 bg-gradient-to-r from-green-900 to-green-700 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
