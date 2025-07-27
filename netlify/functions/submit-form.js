const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Your Airtable credentials
        const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
        const BASE_ID = process.env.BASE_ID;
        const TABLE_NAME = 'Leads';

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
