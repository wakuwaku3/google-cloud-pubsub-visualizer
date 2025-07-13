export interface Topic {
  name: string;
  kmsKeyName?: string;
  labels?: Record<string, string>;
  messageStoragePolicy?: {
    allowedPersistenceRegions?: string[];
  };
  schemaSettings?: {
    schema: string;
    encoding: string;
  };
  satisfiesPzs?: boolean;
  state?: "ACTIVE" | "DELETED";
}

export interface Subscription {
  name: string;
  topic: string;
  pushConfig?: {
    pushEndpoint: string;
    attributes?: Record<string, string>;
    authenticationMethod?: {
      serviceAccountEmail?: string;
    };
  };
  ackDeadlineSeconds?: number;
  retainAckedMessages?: boolean;
  messageRetentionDuration?: string;
  labels?: Record<string, string>;
  expirationPolicy?: {
    ttl: string;
  };
  filter?: string;
  deadLetterPolicy?: {
    deadLetterTopic: string;
    maxDeliveryAttempts: number;
  };
  retryPolicy?: {
    minimumBackoff: string;
    maximumBackoff: string;
  };
  detached?: boolean;
  enableMessageOrdering?: boolean;
  enableExactlyOnceDelivery?: boolean;
  state?: "ACTIVE" | "RESOURCE_ERROR";
}

export interface TopicsResponse {
  topics: Topic[];
  nextPageToken?: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  nextPageToken?: string;
}

export interface TopicWithSubscriptions {
  topic: Topic;
  subscriptions: Subscription[];
}
