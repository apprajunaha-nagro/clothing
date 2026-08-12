-- Ultra-Compatible MySQL Schema for PGmart (phpMyAdmin)

CREATE TABLE IF NOT EXISTS SiteSettings (
    id VARCHAR(50) NOT NULL,
    storeName VARCHAR(255) DEFAULT 'PGmart - Trusted Fashion & Quality Store',
    tagline VARCHAR(255) DEFAULT 'Premium Sarees, Kurtas & Outfits',
    logoUrl TEXT,
    contactEmail VARCHAR(255) DEFAULT 'support@pgmart.in',
    contactPhone VARCHAR(50) DEFAULT '+91 94711 55434',
    address TEXT,
    currencySymbol VARCHAR(10) DEFAULT 'Rs.',
    currencyCode VARCHAR(10) DEFAULT 'INR',
    freeShippingThreshold DECIMAL(10,2) DEFAULT 999.00,
    standardShippingFee DECIMAL(10,2) DEFAULT 79.00,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Category (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    image TEXT,
    status VARCHAR(50) DEFAULT 'active',
    PRIMARY KEY (id),
    UNIQUE KEY (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Product (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    categoryId VARCHAR(50),
    description TEXT,
    fabric VARCHAR(100) DEFAULT 'Cotton Blend',
    fit VARCHAR(100) DEFAULT 'Regular Fit',
    basePrice DECIMAL(10,2) NOT NULL,
    discountPrice DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 4.50,
    status VARCHAR(50) DEFAULT 'published',
    PRIMARY KEY (id),
    UNIQUE KEY (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS CustomerOrder (
    id VARCHAR(50) NOT NULL,
    orderNumber VARCHAR(100) NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    customerPhone VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paymentStatus VARCHAR(50) DEFAULT 'pending',
    paymentMethod VARCHAR(50) DEFAULT 'upi',
    returnStatus VARCHAR(50) DEFAULT 'none',
    PRIMARY KEY (id),
    UNIQUE KEY (orderNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
