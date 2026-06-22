/**
 * Mock Data for Entities
 * Feature Store - RHOAI
 */

export interface Entity {
  id: string;
  name: string;
  description: string;
  joinKey: string;
  valueType: string;
  dataSource: string;
  sourceType: string;
  fileUrl: string;
  created: string;
  lastUpdated: string;
  tags: string[];
  usageCode: string;
  featureStore: string; // Which feature store this entity belongs to
}

export const mockEntities: Entity[] = [
  {
    id: 'entity-001',
    name: 'Customer',
    description: 'Customer entity containing demographic and account information for personalization and segmentation',
    joinKey: 'customer_id',
    valueType: 'INT64',
    dataSource: 'customer_warehouse',
    sourceType: 'Snowflake',
    fileUrl: 'snowflake://prod.warehouse.db/customers',
    created: '2024-01-15T08:30:00Z',
    lastUpdated: '2024-12-05T14:22:00Z',
    tags: ['env=production', 'type=pii', 'team=customer-data'],
    featureStore: 'Customer analytics',
    usageCode: `from feast import FeatureStore

store = FeatureStore(repo_path=".")
entity_df = pd.DataFrame({
    "customer_id": [1001, 1002, 1003]
})

features = store.get_online_features(
    entity_rows=entity_df.to_dict('records'),
    features=["customer:*"]
).to_df()`
  },
  {
    id: 'entity-002',
    name: 'Product',
    description: 'Product catalog entity with SKU information, pricing, and inventory metadata',
    joinKey: 'product_sku',
    valueType: 'STRING',
    dataSource: 'product_catalog',
    sourceType: 'Parquet',
    fileUrl: 's3://feature-store-bucket/products/catalog.parquet',
    created: '2024-02-20T10:15:00Z',
    lastUpdated: '2024-12-08T09:45:00Z',
    tags: ['env=production', 'team=catalog', 'use_case=inventory'],
    featureStore: 'Product recommendations',
    usageCode: `from feast import FeatureStore

store = FeatureStore(repo_path=".")
entity_df = pd.DataFrame({
    "product_sku": ["SKU-001", "SKU-002", "SKU-003"]
})

features = store.get_online_features(
    entity_rows=entity_df.to_dict('records'),
    features=["product:*"]
).to_df()`
  },
  {
    id: 'entity-003',
    name: 'Transaction',
    description: 'Real-time transaction events for fraud detection and behavioral analysis',
    joinKey: 'transaction_id',
    valueType: 'STRING',
    dataSource: 'transaction_stream',
    sourceType: 'Kafka',
    fileUrl: 'kafka://prod-cluster:9092/transactions',
    created: '2024-03-10T12:00:00Z',
    lastUpdated: '2024-12-09T11:30:00Z',
    tags: ['env=production', 'team=analytics', 'use_case=fraud-detection', 'type=real-time'],
    featureStore: 'Fraud detection',
    usageCode: `from feast import FeatureStore

store = FeatureStore(repo_path=".")
entity_df = pd.DataFrame({
    "transaction_id": ["TXN-001", "TXN-002", "TXN-003"]
})

features = store.get_online_features(
    entity_rows=entity_df.to_dict('records'),
    features=["transaction:*"]
).to_df()`
  },
  {
    id: 'entity-004',
    name: 'Driver',
    description: 'Driver profile entity for ride-sharing and delivery services with location and performance metrics',
    joinKey: 'driver_id',
    valueType: 'INT64',
    dataSource: 'driver_profiles',
    sourceType: 'PostgreSQL',
    fileUrl: 'postgresql://prod-db.example.com:5432/drivers',
    created: '2024-04-05T09:20:00Z',
    lastUpdated: '2024-12-07T16:15:00Z',
    tags: ['env=production', 'team=logistics', 'use_case=driver-management'],
    featureStore: 'Fraud detection',
    usageCode: `from feast import FeatureStore

store = FeatureStore(repo_path=".")
entity_df = pd.DataFrame({
    "driver_id": [5001, 5002, 5003]
})

features = store.get_online_features(
    entity_rows=entity_df.to_dict('records'),
    features=["driver:*"]
).to_df()`
  },
  {
    id: 'entity-005',
    name: 'Order',
    description: 'E-commerce order entity tracking order lifecycle, fulfillment status, and customer interactions',
    joinKey: 'order_id',
    valueType: 'STRING',
    dataSource: 'orders_warehouse',
    sourceType: 'BigQuery',
    fileUrl: 'bigquery://project-id.dataset.orders',
    created: '2024-05-12T11:45:00Z',
    lastUpdated: '2024-12-09T08:00:00Z',
    tags: ['env=production', 'team=e-commerce', 'use_case=fulfillment'],
    featureStore: 'Product recommendations',
    usageCode: `from feast import FeatureStore

store = FeatureStore(repo_path=".")
entity_df = pd.DataFrame({
    "order_id": ["ORD-001", "ORD-002", "ORD-003"]
})

features = store.get_online_features(
    entity_rows=entity_df.to_dict('records'),
      features=["order:*"]
    ).to_df()`
  },
  {
    id: 'entity-006',
    name: 'VeryLongEntityNameThatWillTriggerTruncation',
    description: 'A test entity with an extremely long name designed to trigger node truncation in the lineage graph visualization',
    joinKey: 'long_entity_id',
    valueType: 'STRING',
    dataSource: 'customer_warehouse',
    sourceType: 'Snowflake',
    fileUrl: 'snowflake://prod.warehouse.db/long_entities',
    created: '2024-06-01T10:00:00Z',
    lastUpdated: '2024-12-10T12:00:00Z',
    tags: ['env=production', 'team=testing', 'use_case=truncation-test'],
    featureStore: 'Fraud detection',
    usageCode: `from feast import FeatureStore

store = FeatureStore(repo_path=".")
entity_df = pd.DataFrame({
    "long_entity_id": ["LONG-001", "LONG-002", "LONG-003"]
})

features = store.get_online_features(
    entity_rows=entity_df.to_dict('records'),
    features=["verylongentitynamethatwilltriggertruncation:*"]
).to_df()`
  }
];
