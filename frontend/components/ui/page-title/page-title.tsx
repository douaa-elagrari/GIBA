import Link from "next/link";
import "./page-title.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageTitleProps = {
  title: string;
  subtitle?: string;
  precedingTitle?: BreadcrumbItem[];
};

function PageTitle({ title, subtitle, precedingTitle = [] }: PageTitleProps) {
  return (
    <div className="page-title">
      {precedingTitle.length > 0 &&
        precedingTitle.map((item, index) => (
          <span key={index} className="preceding-title">
            {item.href ? (
              <Link href={item.href} className="preceding-title-link">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
            <span className="breadcrumb-separator"> / </span>
          </span>
        ))}
      <h1 className="title">{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  );
}

export default PageTitle;
