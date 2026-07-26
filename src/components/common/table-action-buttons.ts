import { defineComponent, h, type PropType, type VNode } from 'vue';
import { NButton, NPopconfirm, NTooltip, NSpace } from 'naive-ui';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { $t } from '@/locales';

export type TableActionButtonType = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'default';

export interface TableActionItem {
  /** Button text (already i18n-translated). Omit it when `kind` is set. */
  label?: string;
  /**
   * Semantic action kind. When set, the label is resolved from the project's
   * shared i18n (`common.edit` / `common.delete`) so each feature doesn't
   * define its own edit/delete text.
   */
  kind?: 'edit' | 'delete';
  /** Iconify icon name, e.g. 'material-symbols:edit'. */
  icon: string;
  /** naive-ui button type. Controls the ghost color. Defaults to 'default'. */
  type?: TableActionButtonType;
  /** Disable the button. */
  disabled?: boolean;
  /**
   * 鼠标悬停时显示的提示文字。通常用于解释按钮为何不可用（如被禁用）。
   * 提示会用 span 包裹按钮，使按钮在禁用状态下也能正常显示提示（禁用按钮本身会吞掉鼠标事件）。
   */
  tooltip?: string;
  /** Click handler for a plain button. */
  onClick?: () => void;
  /** When provided, render the button as a confirm-before-action (delete) button. */
  popconfirm?: {
    content: string;
    positiveText?: string;
    negativeText?: string;
    onPositiveClick: () => void | Promise<void>;
  };
}

/**
 * Standardized table operation column renderer.
 *
 * Renders a row of "icon + text" action buttons (edit / delete / custom),
 * so every list in the project shares a consistent operation-column style.
 */
export const TableActionButtons = defineComponent({
  name: 'TableActionButtons',
  props: {
    actions: {
      type: Array as PropType<TableActionItem[]>,
      required: true
    },
    size: {
      type: String as PropType<'tiny' | 'small' | 'medium' | 'large'>,
      default: 'small'
    },
    justify: {
      type: String as PropType<'start' | 'center' | 'end' | 'space-between'>,
      default: 'center'
    },
    /** Allow buttons to wrap onto multiple lines. Defaults to false. */
    wrap: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    function resolveLabel(action: TableActionItem): string {
      if (action.label) return action.label;
      if (action.kind === 'edit') return $t('common.edit');
      if (action.kind === 'delete') return $t('common.delete');
      return '';
    }

    function renderButton(action: TableActionItem): VNode {
      const label = resolveLabel(action);

      const button = h(
        NButton,
        {
          size: props.size,
          type: action.type ?? 'default',
          ghost: true,
          disabled: action.disabled,
          onClick: action.onClick
        },
        {
          icon: () => h(SvgIcon, { icon: action.icon }),
          default: () => label
        }
      );

      // 用 span 包裹按钮并挂上 tooltip，使按钮在禁用状态下悬停也能显示提示
      // （禁用的 NButton 会吞掉鼠标事件，套一层 span 即可正常触发）
      let node: VNode = button;
      if (action.tooltip) {
        node = h(
          NTooltip,
          { trigger: 'hover' },
          {
            trigger: () => h('span', { style: 'display: inline-block' }, () => button),
            default: () => action.tooltip!
          }
        );
      }

      if (action.popconfirm) {
        return h(
          NPopconfirm,
          {
            onPositiveClick: action.popconfirm.onPositiveClick,
            positiveText: action.popconfirm.positiveText,
            negativeText: action.popconfirm.negativeText
          },
          {
            trigger: () => node,
            default: () => action.popconfirm!.content
          }
        );
      }

      return node;
    }

    return () =>
      h(NSpace, { justify: props.justify, wrap: props.wrap, size: 8, align: 'center' }, () =>
        props.actions.filter(Boolean).map(action => renderButton(action))
      );
  }
});

export default TableActionButtons;
