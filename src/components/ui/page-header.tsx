// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { useLocation } from "react-router-dom";

// interface PageHeaderProps {
//   title: string;
//   description?: string;
// }

// export function PageHeader({ title, description }: PageHeaderProps) {
//   const location = useLocation();
//   const paths = location.pathname.split("/").filter(Boolean);

//   return (
//     <div className="flex flex-col gap-4 pb-4">
//       <Breadcrumb>
//         <BreadcrumbItem>
//           <BreadcrumbLink href="/">Home</BreadcrumbLink>
//         </BreadcrumbItem>
//         {paths.map((path, index) => {
//           const isLast = index === paths.length - 1;
//           const formattedPath = path
//             .split("-")
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(" ");

//           return (
//             <BreadcrumbItem key={path}>
//               <BreadcrumbSeparator />
//               {isLast ? (
//                 <BreadcrumbPage>{formattedPath}</BreadcrumbPage>
//               ) : (
//                 <BreadcrumbLink href={`/${paths.slice(0, index + 1).join("/")}`}>
//                   {formattedPath}
//                 </BreadcrumbLink>
//               )}
//             </BreadcrumbItem>
//           );
//         })}
//       </Breadcrumb>
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
//         {description && (
//           <p className="text-muted-foreground">{description}</p>
//         )}
//       </div>
//     </div>
//   );
// }


// didnt include the imports and the export statement

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard - </BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const formattedPath = path
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <React.Fragment key={path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formattedPath}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={`/${paths.slice(0, index + 1).join("/")}`}>
                    {formattedPath}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}