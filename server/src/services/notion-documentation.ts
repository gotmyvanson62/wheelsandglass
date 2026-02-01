import { Client } from "@notionhq/client";

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }
    throw Error("Failed to extract page ID");
}

class NotionDocumentationService {
    private notion: Client;
    private pageId: string;

    constructor() {
        if (!process.env.NOTION_INTEGRATION_SECRET) {
            throw new Error('NOTION_INTEGRATION_SECRET environment variable is required');
        }
        
        if (!process.env.NOTION_PAGE_URL) {
            throw new Error('NOTION_PAGE_URL environment variable is required');
        }

        this.notion = new Client({
            auth: process.env.NOTION_INTEGRATION_SECRET,
        });

        this.pageId = extractPageIdFromUrl(process.env.NOTION_PAGE_URL);
    }

    async createSystemArchitecturePage() {
        try {
            const page = await this.notion.pages.create({
                parent: {
                    type: "page_id",
                    page_id: this.pageId
                },
                properties: {
                    title: [
                        {
                            text: {
                                content: "Wheels and Glass - System Architecture"
                            }
                        }
                    ]
                },
                children: [
                    {
                        object: "block",
                        type: "heading_1",
                        heading_1: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "System Architecture Overview"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Comprehensive integration between Squarespace forms and Omega EDI with real-time pricing through Square Appointments and bidirectional SMS communication via Twilio Flex."
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "heading_2",
                        heading_2: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Core Components"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Frontend: React 18 + TypeScript + Tailwind CSS + shadcn/ui"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Backend: Node.js + Express.js + TypeScript + PostgreSQL"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Database: PostgreSQL with Drizzle ORM"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Integrations: Omega EDI, Square Appointments, Twilio Flex, NHTSA VIN API, NAGS Parts Database"
                                    }
                                }
                            ]
                        }
                    }
                ]
            });

            return page;
        } catch (error) {
            console.error('Error creating system architecture page:', error);
            throw error;
        }
    }

    async createDataFlowPage() {
        try {
            const page = await this.notion.pages.create({
                parent: {
                    type: "page_id",
                    page_id: this.pageId
                },
                properties: {
                    title: [
                        {
                            text: {
                                content: "Data Flow & Integration Workflows"
                            }
                        }
                    ]
                },
                children: [
                    {
                        object: "block",
                        type: "heading_1",
                        heading_1: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Customer Journey Data Flow"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "numbered_list_item",
                        numbered_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Customer submits form on wheelsandglass.com with VIN and damage details"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "numbered_list_item",
                        numbered_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Webhook creates transaction and redirects to customer portal"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "numbered_list_item",
                        numbered_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "VIN lookup via NHTSA API + NAGS parts matching + Omega EDI pricing"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "numbered_list_item",
                        numbered_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Customer selects appointment time and books $0 placeholder in Square"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "numbered_list_item",
                        numbered_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Square webhook generates exact Omega EDI pricing and payment link"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: "block",
                        type: "numbered_list_item",
                        numbered_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: "Automated SMS communication via Omega EDI templates and Twilio Flex"
                                    }
                                }
                            ]
                        }
                    }
                ]
            });

            return page;
        } catch (error) {
            console.error('Error creating data flow page:', error);
            throw error;
        }
    }

    async createConfigurationPage() {
        try {
            const configurations = [
                {
                    service: "Omega EDI",
                    settings: [
                        "API Base URL: https://app.omegaedi.com/api/2.0/",
                        "API Key: Environment variable OMEGA_EDI_API_KEY",
                        "Job creation endpoints",
                        "60+ SMS template variables"
                    ]
                },
                {
                    service: "Square Appointments",
                    settings: [
                        "Location ID: E7GCF80WM2V05",
                        "Service catalog setup",
                        "Payment processing integration", 
                        "Booking confirmation webhooks"
                    ]
                },
                {
                    service: "Twilio Flex",
                    settings: [
                        "Workspace SID configuration",
                        "Agent routing rules",
                        "SMS gateway integration",
                        "Escalation procedures"
                    ]
                }
            ];

            const children: any[] = [
                {
                    object: "block",
                    type: "heading_1",
                    heading_1: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: "Integration Configuration Guide"
                                }
                            }
                        ]
                    }
                }
            ];

            // Add configuration for each service
            for (const config of configurations) {
                children.push({
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: config.service
                                }
                            }
                        ]
                    }
                });

                for (const setting of config.settings) {
                    children.push({
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: setting
                                    }
                                }
                            ]
                        }
                    });
                }
            }

            const page = await this.notion.pages.create({
                parent: {
                    type: "page_id",
                    page_id: this.pageId
                },
                properties: {
                    title: [
                        {
                            text: {
                                content: "Configuration & Setup Guide"
                            }
                        }
                    ]
                },
                children
            });

            return page;
        } catch (error) {
            console.error('Error creating configuration page:', error);
            throw error;
        }
    }

    async createSMSTemplatesPage() {
        try {
            const smsTemplates = [
                {
                    name: "Dispatch Introduction",
                    purpose: "Initial contact message introducing dispatch team",
                    template: "This is the Dispatch Department for {Company Name}.\n\nOur team will communicate important information via this phone number. Simply reply to connect with Dispatch.\n\nReference: #{Job Number}\n\n* Text Only. No Photos *\n\n{Company Name}"
                },
                {
                    name: "Quote Details", 
                    purpose: "Detailed quote with vehicle information and pricing",
                    template: "Quote: #{Job Number}\nYear: {Vehicle Year}\nMake: {Vehicle Make}\nModel: {Vehicle Model}\nVIN#: {VIN Number}\nParts: {Glass Part}\n\nTotal: {Total Amount} after tax + free mobile service\n\nSchedule: {Payment Link}\nPrice Match: Reply \"PM\"\nInsured: Reply \"INS\"\nQuote: {Payment Link}"
                },
                {
                    name: "Appointment Confirmed",
                    purpose: "Confirmation with technician and location details",
                    template: "Appointment confirmed for {Appointment Date} at {Appointment Time}.\n\nTechnician: {Technician Name}\nPhone: {Technician Phone}\nLocation: {Service Location}\n\nReference: #{Job Number}\n{Company Name}"
                },
                {
                    name: "Service Complete",
                    purpose: "Service completion with safety and payment information", 
                    template: "Service complete for your {Vehicle Year} {Vehicle Make} {Vehicle Model}.\n\nSafe to drive after: {Safe Drive Time}\nTotal: {Total Amount}\n\nJob #{Job Number}\n{Company Name}"
                }
            ];

            const children: any[] = [
                {
                    object: "block",
                    type: "heading_1",
                    heading_1: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: "SMS Template Library"
                                }
                            }
                        ]
                    }
                },
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: "Professional SMS templates using Omega EDI variables for consistent customer communication. Based on real dispatch conversations for proven effectiveness."
                                }
                            }
                        ]
                    }
                }
            ];

            for (const template of smsTemplates) {
                children.push({
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: template.name
                                }
                            }
                        ]
                    }
                });

                children.push({
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: template.purpose,
                                    annotations: {
                                        italic: true
                                    }
                                }
                            }
                        ]
                    }
                });

                children.push({
                    object: "block",
                    type: "code",
                    code: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: template.template
                                }
                            }
                        ],
                        language: "plain text"
                    }
                });
            }

            const page = await this.notion.pages.create({
                parent: {
                    type: "page_id",
                    page_id: this.pageId
                },
                properties: {
                    title: [
                        {
                            text: {
                                content: "SMS Templates & Communication"
                            }
                        }
                    ]
                },
                children
            });

            return page;
        } catch (error) {
            console.error('Error creating SMS templates page:', error);
            throw error;
        }
    }

    async syncCompleteDocumentation() {
        try {
            console.log('Starting Notion documentation sync...');
            
            const [architecturePage, dataFlowPage, configPage, smsPage] = await Promise.all([
                this.createSystemArchitecturePage(),
                this.createDataFlowPage(), 
                this.createConfigurationPage(),
                this.createSMSTemplatesPage()
            ]);

            console.log('Successfully created documentation pages:', {
                architecture: architecturePage.id,
                dataFlow: dataFlowPage.id,
                configuration: configPage.id,
                smsTemplates: smsPage.id
            });

            return {
                success: true,
                pages: {
                    architecture: architecturePage.id,
                    dataFlow: dataFlowPage.id,
                    configuration: configPage.id,
                    smsTemplates: smsPage.id
                }
            };
        } catch (error) {
            console.error('Error syncing documentation:', error);
            throw error;
        }
    }
}

export const notionDocumentationService = new NotionDocumentationService();