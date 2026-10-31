import { uiText } from "@/i18n/uiText";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DebugLogger } from '@/services/DebugLogger';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    DebugLogger.error('ui', 'User attempted to access non-existent route', { path: location.pathname });
  }, [location.pathname]);

  // The host answers 200 for every path (single-page app), so an unknown route is a soft 404.
  // Telling crawlers not to index it is the in-repo mitigation; a real 404 status needs the host.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page not found | Time-2-Read";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4"> {uiText("Oops! Page not found")} </p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
           {uiText("Return to Home")} </a>
      </div>
    </div>
  );
};

export default NotFound;
