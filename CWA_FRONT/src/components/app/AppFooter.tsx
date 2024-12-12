export default function AppFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">ЛитераТек</span>
              <span className="text-sm text-gray-400 mt-1.5">© {new Date().getFullYear()}</span>
            </div>
            
            <div className="text-sm text-gray-400 flex items-center space-x-4">
              <span>support@literatech.ru</span>
              <span>·</span>
              <span>Все права защищены</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  