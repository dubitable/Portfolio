export type Project = {
  name: string;
  subtitle: string;
  desc: string;
  categories: string;
  date: string;
  href: string;
  src: string;
};

const ProjectCard = ({
  project: { desc, name, subtitle, date, categories, href, src },
}: {
  project: Project;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mx-20"
    >
      <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>

      <div className="sm:flex sm:justify-between sm:gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">{name}</h3>

          <p className="mt-1 text-xs font-medium text-gray-600">{subtitle}</p>
        </div>

        <div className="hidden sm:block sm:shrink-0">
          <img src={src} className="h-20 rounded-lg object-cover shadow-sm" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-pretty text-sm text-gray-500">{desc}</p>
      </div>

      <dl className="mt-6 flex gap-4 sm:gap-6">
        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-gray-600">{date}</dt>
          <dd className="text-xs text-gray-500">Created</dd>
        </div>

        <div className="flex flex-col-reverse">
          <dt className="text-sm font-medium text-gray-600">{categories}</dt>
          <dd className="text-xs text-gray-500">Categories</dd>
        </div>
      </dl>
    </a>
  );
};

export default ProjectCard;
