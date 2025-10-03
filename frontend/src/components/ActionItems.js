import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllActionItems } from '../api/actionItems';

const ActionItems = () => {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActionItems = async () => {
      try {
        setLoading(true);
        const items = await getAllActionItems();
        
        // Group by contact and sort by most recent note date
        const groupedItems = groupActionItemsByContact(items);
        setActionItems(groupedItems);
      } catch (err) {
        console.error('Error fetching action items:', err);
        setError('Failed to load action items');
      } finally {
        setLoading(false);
      }
    };

    fetchActionItems();
  }, []);

  const groupActionItemsByContact = (items) => {
    const grouped = {};
    
    items.forEach(item => {
      const contactKey = item.contact_id;
      if (!grouped[contactKey]) {
        grouped[contactKey] = {
          contact: {
            id: item.contact_id,
            name: item.contact_name,
            email: item.contact_email,
            company: item.contact_company
          },
          actionItems: [],
          mostRecentNoteDate: item.note_updated_at
        };
      }
      
      grouped[contactKey].actionItems.push({
        noteId: item.note_id,
        content: item.content,
        createdAt: item.note_created_at,
        updatedAt: item.note_updated_at
      });
      
      // Update most recent note date if this note is more recent
      if (item.note_updated_at > grouped[contactKey].mostRecentNoteDate) {
        grouped[contactKey].mostRecentNoteDate = item.note_updated_at;
      }
    });

    // Convert to array and sort by most recent interaction (note date)
    return Object.values(grouped).sort((a, b) => 
      new Date(b.mostRecentNoteDate) - new Date(a.mostRecentNoteDate)
    );
  };

  const extractActionItems = (content) => {
    // Split content by lines and find lines containing @action
    const lines = content.split('\n');
    const actionLines = lines.filter(line => 
      line.toLowerCase().includes('@action')
    );
    
    return actionLines.map(line => {
      // Remove @action and clean up the text
      return line.replace(/@action/gi, '').replace(/["""]/g, '').trim();
    }).filter(line => line.length > 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading action items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#c00' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#333', 
          margin: '0 0 8px 0' 
        }}>
          Action Items
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#666', 
          margin: 0 
        }}>
          All @action items from contacts' notes, grouped by contact and sorted by most recent interaction.
        </p>
      </div>

      {actionItems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ fontSize: '20px', color: '#666', margin: '0 0 8px 0' }}>
            No Action Items Found
          </h3>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
            Add "@action" to your contact notes to see them here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {actionItems.map(({ contact, actionItems: items, mostRecentNoteDate }) => (
            <div key={contact.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {/* Contact Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <Link 
                    to={`/profile/${contact.id}`}
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#4B0082',
                      textDecoration: 'none',
                      marginBottom: '4px',
                      display: 'block'
                    }}
                  >
                    {contact.name}
                  </Link>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {contact.email && (
                      <span style={{ marginRight: '16px' }}>📧 {contact.email}</span>
                    )}
                    {contact.company && (
                      <span>🏢 {contact.company}</span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#888',
                  textAlign: 'right'
                }}>
                  Last updated<br/>
                  {formatDate(mostRecentNoteDate)}
                </div>
              </div>

              {/* Action Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item, index) => {
                  const actions = extractActionItems(item.content);
                  return actions.map((action, actionIndex) => (
                    <div key={`${item.noteId}-${actionIndex}`} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '4px solid #4B0082'
                    }}>
                      <div style={{ 
                        fontSize: '16px',
                        marginTop: '2px'
                      }}>
                        ⚡
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '15px', 
                          color: '#333',
                          lineHeight: '1.4'
                        }}>
                          {action}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#888',
                          marginTop: '4px'
                        }}>
                          From note • {formatDate(item.updatedAt)}
                        </div>
                      </div>
                    </div>
                  ));
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionItems;
