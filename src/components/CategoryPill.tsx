import clsx from 'clsx';
import { Category } from '../types';

type Props = {
  category: Category;
  active?: boolean;
  onClick?: () => void;
};

export const CategoryPill = ({ category, active, onClick }: Props) => {
  return (
    <button
      type="button"
      className={clsx('badge', active ? 'accent' : undefined)}
      onClick={onClick}
    >
      <span>#{category.name}</span>
      {category.description && <span className="small">{category.description}</span>}
    </button>
  );
};
