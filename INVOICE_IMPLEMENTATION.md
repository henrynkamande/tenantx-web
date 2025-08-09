# Invoice View and Download Implementation

This document summarizes the implementation of secure invoice viewing and downloading functionality for both landlords and tenants.

## Features Implemented

### 1. **Landlord Invoice Management** (`/pages/invoices/index.vue`)
- Complete invoice management interface
- View, send, download, and mark invoices as paid
- Filter by status, tenant, property, and date range
- Statistics dashboard with outstanding amounts, paid amounts, and overdue counts

### 2. **Tenant Invoice Access** (`/pages/tenant/invoices/index.vue`)
- Tenant-specific invoice viewing page
- View and download invoices that belong to them
- Personal invoice statistics
- Payment method information display

### 3. **Secure API Endpoints**

#### Landlord Endpoints:
- `GET /api/invoices` - List landlord's invoices with filters
- `GET /api/invoices/stats` - Invoice statistics for landlord
- `POST /api/invoices` - Create new invoices
- `GET /api/invoices/[id]/view` - View invoice (secure access)
- `GET /api/invoices/[id]/download` - Download invoice PDF (secure access)
- `POST /api/invoices/[id]/send` - Send invoice via email
- `POST /api/invoices/[id]/pay` - Mark invoice as paid

#### Tenant Endpoints:
- `GET /api/tenant/invoices` - List tenant's invoices with filters
- `GET /api/tenant/invoice-stats` - Invoice statistics for tenant
- `GET /api/tenant/properties` - Get tenant's properties
- `GET /api/tenant/landlord-info` - Get landlord contact info and payment methods

## Security Features

### **User Access Control**
- **Landlords** can only access invoices for properties they own
- **Tenants** can only access invoices issued to them
- All endpoints verify user authentication and authorization
- Role-based access control (landlord vs tenant)

### **Data Protection**
- Invoice access verified against user's properties (landlord) or tenant ID (tenant)
- No direct database access - all queries filtered by user ownership
- Secure PDF generation with user verification

### **API Security**
- JWT token authentication required for all endpoints
- Proper error handling with appropriate HTTP status codes
- Input validation and sanitization

## Technical Implementation

### **Frontend Components**
1. **Invoice List** - Displays invoices in a table format with actions
2. **Filters** - Status, tenant, property, and date range filtering
3. **Statistics Cards** - Real-time statistics display
4. **Download/View Actions** - Secure PDF generation and viewing

### **Backend Services**
1. **Invoice Template Service** - Generates branded HTML/PDF invoices
2. **PDF Generator Service** - Converts invoices to downloadable PDFs
3. **Authentication Service** - Verifies user access rights
4. **Invoice Numbering Service** - Generates unique invoice numbers

### **Database Schema**
- **Invoice Model** - Complete invoice data structure
- **User Models** - Landlord and Tenant with proper relationships
- **Property/Unit Models** - Property and unit relationships
- **Payment Methods** - Landlord payment method configurations

## Usage

### **For Landlords:**
1. Navigate to `/invoices` to manage invoices
2. Use filters to find specific invoices
3. Click "View" to preview invoice in new tab
4. Click "Download" to get PDF file
5. Use "Send" to email invoices to tenants
6. Mark invoices as "Paid" when payments received

### **For Tenants:**
1. Navigate to `/tenant/invoices` to view personal invoices
2. Filter by status and date range
3. Click "View" to see invoice details
4. Click "Download" to get PDF copy
5. View payment method information at bottom of page

## File Structure

```
server/
├── api/
│   ├── invoices/
│   │   ├── index.get.ts           # List landlord invoices
│   │   ├── index.post.ts          # Create invoice
│   │   ├── stats.get.ts           # Invoice statistics
│   │   └── [id]/
│   │       ├── view.get.ts        # View invoice (secure)
│   │       ├── download.get.ts    # Download PDF (secure)
│   │       ├── send.post.ts       # Send invoice
│   │       └── pay.post.ts        # Mark as paid
│   └── tenant/
│       ├── invoices.get.ts        # List tenant invoices
│       ├── invoice-stats.get.ts   # Tenant statistics
│       ├── properties.get.ts      # Tenant properties
│       └── landlord-info.get.ts   # Payment methods
├── models/
│   └── Invoice.ts                 # Invoice data model
└── services/
    ├── invoiceTemplate.ts         # Template generation
    └── pdfGenerator.ts            # PDF creation

pages/
├── invoices/
│   └── index.vue                  # Landlord invoice management
└── tenant/
    └── invoices/
        └── index.vue              # Tenant invoice viewing
```

## Security Considerations

1. **Access Control** - Users can only access their own invoices
2. **Data Validation** - All inputs validated and sanitized
3. **Authentication** - JWT tokens required for all operations
4. **Authorization** - Role-based permissions enforced
5. **Error Handling** - Proper error responses without data leakage

## Testing

To test the implementation:

1. **As Landlord:**
   - Login and navigate to `/invoices`
   - Create, view, and download invoices
   - Verify you can only see your own property invoices

2. **As Tenant:**
   - Login and navigate to `/tenant/invoices`
   - View and download your invoices
   - Verify you can only see invoices issued to you

The implementation ensures that users can only access invoices they are authorized to see, providing secure and user-friendly invoice management for both landlords and tenants.
