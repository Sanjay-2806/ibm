import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type ApiKeyTeamInformationControllerGetUsageResponse200 = FromSchema<typeof schemas.ApiKeyTeamInformationControllerGetUsage.response['200']>;
export type AsyncRetrieveJobMetadataParam = FromSchema<typeof schemas.AsyncRetrieveJob.metadata>;
export type AsyncRetrieveJobResponse200 = FromSchema<typeof schemas.AsyncRetrieveJob.response['200']>;
export type AsyncTtsBodyParam = FromSchema<typeof schemas.AsyncTts.body>;
export type AsyncTtsResponse201 = FromSchema<typeof schemas.AsyncTts.response['201']>;
export type RetrieveSpeakersMetadataParam = FromSchema<typeof schemas.RetrieveSpeakers.metadata>;
export type RetrieveSpeakersResponse200 = FromSchema<typeof schemas.RetrieveSpeakers.response['200']>;
export type SyncTtsBodyParam = FromSchema<typeof schemas.SyncTts.body>;
export type SyncTtsResponse201 = FromSchema<typeof schemas.SyncTts.response['201']>;
