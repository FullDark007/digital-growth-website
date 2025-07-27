exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Your Airtable credentials from environment variables
        const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
        const BASE_ID = process.env.BASE_ID;
        const TABLE_NAME = 'Leads';

        if (!AIRTABLE_TOKEN || !BASE_ID) {
            console.error('Missing environment variables');
            throw new Error('Missing environment variables');
        }

        const airtableData = {
            records: [{
                fields: {
                    'Name': data.name || '',
                    'Email Address': data.email || '',
                    'Phone Number': data.phone || '',
                    'Company': data.company || '',
                    'Message': data.message || '',
                    'Date Submitted': new Date().toISOString().split('T')[0],
                    'Status': 'New',
                    'Priority': 'Medium',
                    'Lead Source': 'Website Form'
                }
            }]
        };

        console.log('Sending to Airtable:', JSON.stringify(airtableData, null, 2));

        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Airtable success:', result);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            const errorData = await response.text();
            console.error('Airtable API error:', response.status, errorData);
            throw new Error(`Airtable API error: ${response.status} - ${errorData}`);
        }

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to submit form',
                details: error.message 
            })
        };
    }
};
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        } else {
            const errorData = await response.text();
            console.error('Airtable API error:', errorData);
            throw new Error('Airtable API error');
        }

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to submit form' })
        };
    }
};
