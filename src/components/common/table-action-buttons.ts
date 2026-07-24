import { defineComponent, h, type PropType, type VNode } from 'vue';
import { NButton, NPopconfirm, NSpace } from 'naive-ui';
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

      if (action.popconfirm) {
        return h(
          NPopconfirm,
          {
            onPositiveClick: action.popconfirm.onPositiveClick,
            positiveText: action.popconfirm.positiveText,
            negativeText: action.popconfirm.negativeText
          },
          {
            trigger: () => button,
            default: () => action.popconfirm!.content
          }
        );
      }

      return button;
    }

    return () =>
      h(NSpace, { justify: props.justify, wrap: props.wrap, size: 8, align: 'center' }, () =>
        props.actions.filter(Boolean).map(action => renderButton(action))
      );
  }
});

export default TableActionButtons;
