# Animal Management - Database Setup & MySQL Queries

## Supabase Table Setup

### Table 1: animals
```sql
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  animal_type VARCHAR(100) NOT NULL,
  count INTEGER DEFAULT 0,
  icon VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_animals_created_at ON animals(created_at);
CREATE INDEX idx_animals_animal_type ON animals(animal_type);
```

### Table 2: animal_productions
```sql
CREATE TABLE animal_productions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_animal_productions_animal_id ON animal_productions(animal_id);
CREATE INDEX idx_animal_productions_date ON animal_productions(date);
CREATE INDEX idx_animal_productions_created_at ON animal_productions(created_at);
```

---

## MySQL Queries for Equivalent Setup

### Table 1: animals
```sql
CREATE TABLE animals (
  id CHAR(36) PRIMARY KEY DEFAULT UUID(),
  name VARCHAR(255) NOT NULL,
  animal_type VARCHAR(100) NOT NULL,
  count INT DEFAULT 0,
  icon VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_animals_created_at ON animals(created_at);
CREATE INDEX idx_animals_animal_type ON animals(animal_type);
```

### Table 2: animal_productions
```sql
CREATE TABLE animal_productions (
  id CHAR(36) PRIMARY KEY DEFAULT UUID(),
  animal_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE INDEX idx_animal_productions_animal_id ON animal_productions(animal_id);
CREATE INDEX idx_animal_productions_date ON animal_productions(date);
CREATE INDEX idx_animal_productions_created_at ON animal_productions(created_at);
```

---

## Common CRUD Operations in MySQL

### INSERT - Add a new animal
```sql
INSERT INTO animals (name, animal_type, count, icon) 
VALUES ('Bessie', 'Cow', 5, '🐄');
```

### INSERT - Add production record
```sql
INSERT INTO animal_productions (animal_id, date, quantity, price, notes)
VALUES ('550e8400-e29b-41d4-a716-446655440000', '2026-01-24', 12.5, 24, 'Good health');
```

### SELECT - Get all animals
```sql
SELECT * FROM animals 
ORDER BY created_at DESC;
```

### SELECT - Get animal details with production summary
```sql
SELECT 
  a.id,
  a.name,
  a.animal_type,
  a.count,
  a.icon,
  COUNT(ap.id) AS total_records,
  SUM(ap.quantity) AS total_production,
  AVG(ap.quantity) AS avg_daily_production,
  SUM(ap.quantity * ap.price) AS total_revenue
FROM animals a
LEFT JOIN animal_productions ap ON a.id = ap.animal_id
WHERE a.id = 'animal-id-here'
GROUP BY a.id, a.name, a.animal_type, a.count, a.icon;
```

### SELECT - Get all productions for an animal
```sql
SELECT * FROM animal_productions
WHERE animal_id = 'animal-id-here'
ORDER BY date DESC;
```

### SELECT - Get production statistics (Monthly)
```sql
SELECT 
  DATE_TRUNC('month', date) AS month,
  SUM(quantity) AS total_quantity,
  AVG(quantity) AS avg_quantity,
  SUM(quantity * price) AS total_revenue,
  COUNT(*) AS record_count
FROM animal_productions
WHERE animal_id = 'animal-id-here'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

### UPDATE - Update animal count
```sql
UPDATE animals 
SET count = 10, updated_at = CURRENT_TIMESTAMP
WHERE id = 'animal-id-here';
```

### UPDATE - Update production record
```sql
UPDATE animal_productions
SET quantity = 15, price = 25, notes = 'Updated note', updated_at = CURRENT_TIMESTAMP
WHERE id = 'production-id-here';
```

### DELETE - Delete production record
```sql
DELETE FROM animal_productions
WHERE id = 'production-id-here';
```

### DELETE - Delete animal (cascades to productions)
```sql
DELETE FROM animals
WHERE id = 'animal-id-here';
```

---

## Advanced Analytics Queries

### Total production by animal type (Monthly)
```sql
SELECT 
  a.animal_type,
  DATE_TRUNC('month', ap.date) AS month,
  SUM(ap.quantity) AS total_production,
  SUM(ap.quantity * ap.price) AS total_revenue,
  COUNT(DISTINCT a.id) AS animal_count
FROM animals a
LEFT JOIN animal_productions ap ON a.id = ap.animal_id
GROUP BY a.animal_type, DATE_TRUNC('month', ap.date)
ORDER BY a.animal_type, month DESC;
```

### Best performing animals
```sql
SELECT 
  a.id,
  a.name,
  a.animal_type,
  COUNT(ap.id) AS record_count,
  SUM(ap.quantity) AS total_production,
  AVG(ap.quantity) AS avg_daily,
  SUM(ap.quantity * ap.price) AS total_revenue
FROM animals a
LEFT JOIN animal_productions ap ON a.id = ap.animal_id
GROUP BY a.id, a.name, a.animal_type
ORDER BY total_revenue DESC
LIMIT 10;
```

### Production trend (Last 30 days)
```sql
SELECT 
  ap.date,
  COUNT(DISTINCT ap.animal_id) AS animals_recorded,
  SUM(ap.quantity) AS total_production,
  SUM(ap.quantity * ap.price) AS daily_revenue
FROM animal_productions ap
WHERE ap.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ap.date
ORDER BY ap.date DESC;
```

---

## Notes

1. **Supabase**: Uses PostgreSQL - adjust queries as needed
2. **MySQL**: Some functions like DATE_TRUNC may need replacement with DATE_FORMAT
3. **UUID**: Both systems support UUID, but MySQL needs explicit type definition
4. **Cascade Delete**: Production records are automatically deleted when animal is deleted
5. **Timestamps**: Automatically managed by created_at and updated_at fields

---

## For MySQL Adjustments

Replace `DATE_TRUNC('month', date)` with `DATE_FORMAT(date, '%Y-%m-01')` for monthly grouping
Replace `CURRENT_TIMESTAMP` with `NOW()`
