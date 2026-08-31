import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import './pageHeader.css';

interface PageHeaderProps {
  title: string;
  breadcrumb?: { label: string; to: string }[];
}

export function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  return (
    <div className="page-header">
      {breadcrumb?.map((crumb) => (
        <Fragment key={crumb.to}>
          <Link to={crumb.to} className="page-header-crumb">
            {crumb.label}
          </Link>
          <span className="page-header-sep" aria-hidden="true">
            &gt;
          </span>
        </Fragment>
      ))}
      <h1>{title}</h1>
    </div>
  );
}
