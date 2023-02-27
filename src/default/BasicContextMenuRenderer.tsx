import { uniqueId } from 'lodash-es';
import { MenuRenderer } from 'plugins/context/component/ContextMenuContainer';
import { absurd } from 'utils';

const BasicContextMenuRenderer: MenuRenderer = ({ menu }) => (
  <>
    {menu.map(item => {
      switch (item.type) {
        case 'divider':
          return (
            <div
              key={uniqueId('divider-')}
              style={{ border: '1px solid black' }}
            ></div>
          );
        case 'action':
          return (
            <button key={item.id} onClick={() => item.onTrigger()}>
              {item.text}
            </button>
          );
        default:
          return absurd(item);
      }
    })}
  </>
);

export default BasicContextMenuRenderer;
