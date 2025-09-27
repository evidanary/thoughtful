import React, { useState, useEffect } from 'react';
import AddEmailTemplateModal from './AddEmailTemplateModal';
import { getAllEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '../api/emailTemplates';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load templates from API
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await getAllEmailTemplates();
      setTemplates(templatesData);
      setError("");
    } catch (err) {
      console.error("Error loading templates:", err);
      setError("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async (newTemplate) => {
    try {
      const createdTemplate = await createEmailTemplate(newTemplate);
      setTemplates([createdTemplate, ...templates]);
      setShowAddModal(false);
      setError("");
    } catch (err) {
      console.error("Error creating template:", err);
      setError("Failed to create email template");
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowAddModal(true);
  };

  const handleUpdateTemplate = async (updatedTemplate) => {
    try {
      const updated = await updateEmailTemplate(updatedTemplate.id, updatedTemplate);
      setTemplates(templates.map(t => 
        t.id === updated.id ? updated : t
      ));
      setEditingTemplate(null);
      setShowAddModal(false);
      setError("");
    } catch (err) {
      console.error("Error updating template:", err);
      setError("Failed to update email template");
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteEmailTemplate(templateId);
        setTemplates(templates.filter(t => t.id !== templateId));
        setError("");
      } catch (err) {
        console.error("Error deleting template:", err);
        setError("Failed to delete email template");
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTemplate(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(90deg, #4B0082, #FFB6C1, #00BFFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            Email Templates
          </h1>
          
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#4B0082',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(75, 0, 130, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5a1a9b';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4B0082';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '18px' }}>✉️</span>
            Add New Template
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Loading templates...</h3>
            <p style={{ margin: 0, color: '#666' }}>Please wait while we fetch your email templates</p>
          </div>
        ) : (
          /* Templates List */
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {templates.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No templates yet</h3>
              <p style={{ margin: 0 }}>Create your first email template to get started</p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 3fr 4fr 1fr',
                gap: '16px',
                padding: '16px 24px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                fontWeight: '600',
                fontSize: '14px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <div>Template Name</div>
                <div>Subject</div>
                <div>Body</div>
                <div>Actions</div>
              </div>

              {/* Template Rows */}
              {templates.map((template, index) => (
                <div
                  key={template.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 3fr 4fr 1fr',
                    gap: '16px',
                    padding: '20px 24px',
                    borderBottom: index < templates.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  {/* Template Name */}
                  <div style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#333'
                  }}>
                    {template.name}
                  </div>

                  {/* Subject */}
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    {template.subject}
                  </div>

                  {/* Body Preview */}
                  <div style={{
                    fontSize: '14px',
                    color: '#888',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {template.body}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #00BFFF',
                        color: '#00BFFF',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#00BFFF';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#00BFFF';
                      }}
                      title="Edit template"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #dc3545',
                        color: '#dc3545',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dc3545';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#dc3545';
                      }}
                      title="Delete template"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Add/Edit Template Modal */}
        {showAddModal && (
          <AddEmailTemplateModal
            template={editingTemplate}
            onSave={editingTemplate ? handleUpdateTemplate : handleAddTemplate}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
