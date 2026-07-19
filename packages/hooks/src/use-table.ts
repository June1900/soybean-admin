import { computed, onMounted, ref } from 'vue';
import type { Ref, VNodeChild } from 'vue';
import useBoolean from './use-boolean';
import useLoading from './use-loading';

export interface PaginationData<T> {
  data: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

type GetApiData<ApiData, Pagination extends boolean> = Pagination extends true ? PaginationData<ApiData> : ApiData[];

type Transform<ResponseData, ApiData, Pagination extends boolean> = (
  response: ResponseData
) => GetApiData<ApiData, Pagination>;

export type TableColumnCheckTitle = string | ((...args: any) => VNodeChild);

export type TableColumnCheck = {
  key: string;
  title: TableColumnCheckTitle;
  checked: boolean;
  visible: boolean;
  fixed: 'left' | 'right' | 'unFixed';
  /**
   * locked columns (e.g. the table operation column) cannot be hidden or moved
   * via the column settings; they are always shown, pinned to the right.
   */
  lock?: boolean;
};

export interface UseTableOptions<ResponseData, ApiData, Column, Pagination extends boolean> {
  /**
   * api function to get table data
   */
  api: () => Promise<ResponseData>;
  /**
   * whether to enable pagination
   */
  pagination?: Pagination;
  /**
   * transform api response to table data
   */
  transform: Transform<ResponseData, ApiData, Pagination>;
  /**
   * columns factory
   */
  columns: () => Column[];
  /**
   * get column checks
   */
  getColumnChecks: (columns: Column[]) => TableColumnCheck[];
  /**
   * get columns
   */
  getColumns: (columns: Column[], checks: TableColumnCheck[]) => Column[];
  /**
   * callback when response fetched
   */
  onFetched?: (data: GetApiData<ApiData, Pagination>) => void | Promise<void>;
  /**
   * whether to get data immediately
   *
   * @default true
   */
  immediate?: boolean;
}

export default function useTable<ResponseData, ApiData, Column, Pagination extends boolean>(
  options: UseTableOptions<ResponseData, ApiData, Column, Pagination>
) {
  const { loading, startLoading, endLoading } = useLoading();
  const { bool: empty, setBool: setEmpty } = useBoolean();

  const { api, pagination, transform, columns, getColumnChecks, getColumns, onFetched, immediate = true } = options;

  const data = ref([]) as Ref<ApiData[]>;

  const columnChecks = ref(getColumnChecks(columns())) as Ref<TableColumnCheck[]>;

  const $columns = computed(() => getColumns(columns(), columnChecks.value));

  function reloadColumns() {
    const checkMap = new Map(columnChecks.value.map(col => [col.key, col.checked]));
    const fixedMap = new Map(columnChecks.value.map(col => [col.key, col.fixed]));

    const defaultChecks = getColumnChecks(columns());

    columnChecks.value = defaultChecks.map(col => {
      // locked columns (e.g. the operation column) are always visible, pinned
      // to the right and cannot be toggled off by the user.
      if (col.lock) {
        return { ...col, checked: true, fixed: 'right' as const };
      }

      return {
        ...col,
        checked: checkMap.get(col.key) ?? col.checked,
        fixed: (fixedMap.get(col.key) !== 'unFixed' ? fixedMap.get(col.key) : undefined) ?? col.fixed
      };
    });
  }

  async function getData() {
    try {
      startLoading();

      const response = await api();

      const transformed = transform(response);

      data.value = getTableData(transformed, pagination);

      setEmpty(data.value.length === 0);

      await onFetched?.(transformed);
    } finally {
      endLoading();
    }
  }

  // NOTE: defer the initial fetch to onMounted. The page-level `api`/`transform`
  // callbacks typically read values (e.g. `mobilePagination`) that are part of
  // the same `const { ... } = useNaivePaginatedTable(...)` destructuring, so
  // calling `getData()` synchronously here (during setup, before the destructuring
  // completes) triggers a TDZ `ReferenceError`. By mount time all bindings exist.
  if (immediate) {
    onMounted(() => {
      void getData();
    });
  }

  return {
    loading,
    empty,
    data,
    columns: $columns,
    columnChecks,
    reloadColumns,
    getData
  };
}

function getTableData<ApiData, Pagination extends boolean>(
  data: GetApiData<ApiData, Pagination>,
  pagination?: Pagination
) {
  if (pagination) {
    return (data as PaginationData<ApiData>).data;
  }

  return data as ApiData[];
}
