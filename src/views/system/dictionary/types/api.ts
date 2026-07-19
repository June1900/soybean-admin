/** A system dictionary. `ID` is the primary key. */
export interface Dictionary {
  ID: number;
  /** 字典名（中） */
  name: string;
  /** 字典名（英） */
  type: string;
  /** 开启 / 停用 */
  status: boolean;
  desc: string;
  parentID?: number | null;
}

/** Payload for creating / updating a dictionary. */
export interface DictionaryForm {
  ID?: number;
  name: string;
  type: string;
  status?: boolean;
  desc: string;
  parentID?: number | null;
}

/** Query params for getSysDictionaryList */
export interface DictionaryListQuery {
  name?: string;
  type?: string;
}

/** Frontend search form model for dictionary list */
export interface DictionarySearchParams {
  name: string;
  type: string;
}

/** A dictionary detail item. `ID` is the primary key. */
export interface DictionaryDetail {
  ID: number;
  label: string;
  value: string;
  extend?: string;
  status: boolean;
  sort: number;
  parentID?: number | null;
  sysDictionaryID?: number;
  level?: number;
  children?: DictionaryDetail[];
}

/** Payload for creating / updating a dictionary detail. */
export interface DictionaryDetailForm {
  ID?: number;
  label: string;
  value: string;
  extend?: string;
  status?: boolean;
  sort: number;
  parentID?: number | null;
  sysDictionaryID?: number;
}

/** Query params for getSysDictionaryDetailList */
export interface DictionaryDetailListQuery {
  sysDictionaryID?: number;
}
