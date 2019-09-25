import {copy, strEnum} from './utilities';


const versionsDef = ['1', '2'] as const ;
export const versions = copy(versionsDef);
const versionsEnum = strEnum(versionsDef);
export type Version = keyof typeof versionsEnum;

const v1PurposesDef = ['personalisedAdvertising'] as const ;
export const v1Purposes = copy(v1PurposesDef);
const v1PurposesEnum = strEnum(v1PurposesDef);
export type V1Purposes = keyof typeof v1PurposesEnum;
export type V1PurposeObj = {
  [key in V1Purposes]: boolean
};

const v2PurposesDef =
    ['essential', 'performance', 'functionality', 'personalisedAdvertising'] as
    const ;
export const v2Purposes = copy(v2PurposesDef);
const v2PurposesEnum = strEnum(v2PurposesDef);
export type V2Purposes = keyof typeof v2PurposesEnum;
export type V2PurposeObj = {
  [key in V2Purposes]: boolean
};

const sourcesDef = ['cmp-ui', 'ios', 'www', 'support', 'amp'] as const ;
export const sources = copy(sourcesDef);
const sourcesEnum = strEnum(sourcesDef);
export type Source = keyof typeof sourcesEnum;


// initial CMP excludes PECR purposes
export type CmpRecordV1 = {
  iab: string,
  version: '1',
  time: number,
  source: Source,
  purposes: V1PurposeObj,
  browserId: string
};
// CMP that includes PECR purposes
export type CmpRecordV2 = {
  iab: string,
  version: '2',
  time: number,
  source: Source,
  purposes: V2PurposeObj,
  browserId: string
};
export type CmpRecord = CmpRecordV1|CmpRecordV2;
