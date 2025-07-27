exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
        const BASE_ID = process.env.BASE_ID;
        const TABLE_NAME = 'Website Leads';

        if (!AIRTABLE_TOKEN || !BASE_ID) {
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
                    'Date Submitted': new Date().toLocaleDateString('en-CA'),
                    'Status': 'New',
                    'Priority': 'Medium',
                    'Lead Source': 'Website Form'
                }
            }]
        };

        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });

        if (response.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            const errorData = await response.text();
            throw new Error(`Airtable API error: ${response.status}`);
        }

    } catch (error) {
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
