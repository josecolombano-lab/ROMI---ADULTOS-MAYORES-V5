import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { SplashScreen } from './SplashScreen';
import { MainMenu } from './MainMenu';
import { AgendaView } from './AgendaView';
import { NotesView } from './NotesView';
import { ExternalView } from './ExternalView';
import { RegisterView } from './RegisterView';
import { LoginView } from './LoginView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.SPLASH);

  useEffect(() => {
    // Show splash screen for 3 seconds (Updated from 2s)
    const timer = setTimeout(() => {
      setCurrentView(ViewState.HOME);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
  };

  const goHome = () => {
    setCurrentView(ViewState.HOME);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.SPLASH:
        return <SplashScreen />;
      case ViewState.HOME:
        return <MainMenu onNavigate={navigateTo} />;
      case ViewState.REGISTER:
        return <RegisterView onBack={goHome} onRegisterSuccess={goHome} />;
      case ViewState.LOGIN:
        return (
          <LoginView 
            onBack={goHome} 
            onLoginSuccess={goHome} 
            onRegister={() => navigateTo(ViewState.REGISTER)}
          />
        ); 
      case ViewState.NEWS:
        return (
          <ExternalView
            title="NOTICIAS Y CLIMA"
            links={[
              { title: "Infobae", url: "https://www.infobae.com/", description: "Manténgase informado con las últimas noticias." },
              { title: "BBC Mundo", url: "https://www.bbc.com/mundo", description: "Noticias internacionales." },
              { title: "Google Noticias", url: "https://news.google.com/", description: "Todas las noticias del mundo en un solo lugar." },
              { title: "Clima Mundial (AccuWeather)", url: "https://www.accuweather.com/es", description: "Busque su ciudad y vea el clima de todo el mundo." }
            ]}
            onBack={goHome}
          />
        );
      case ViewState.HEALTH:
        return (
          <ExternalView
            title="SALUD"
            links={[
              { title: "Clínica Mayo", url: "https://www.mayoclinic.org/es", description: "Información médica de confianza." },
              { title: "MedlinePlus", url: "https://medlineplus.gov/spanish/", description: "Información de salud para usted." }
            ]}
            onBack={goHome}
          />
        );
      case ViewState.GAMES:
        return (
          <ExternalView
            title="JUEGOS"
            links={[
              { title: "Juegos de Habilidad", url: "https://mayoresconectados.com.ar/juegos-adultos-habilidad", description: "Ejercite su mente con juegos variados." }
            ]}
            onBack={goHome}
          />
        );
      case ViewState.AGENDA:
        return <AgendaView onBack={goHome} />;
      case ViewState.NOTES:
        return <NotesView onBack={goHome} />;
      case ViewState.PREMIUM:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-bold text-[#FFD580] mb-8">PREMIUM</h1>
            <div className="bg-[#FFD580]/10 p-10 rounded-3xl border-2 border-[#FFD580]/30 max-w-md">
              <p className="text-3xl font-bold text-[#FFFDD0] mb-6">
                COSAS MARAVILLOSAS PASARAN PRONTO 🏗️
              </p>
              <button 
                onClick={goHome}
                className="mt-8 bg-[#FFD580] text-[#001F3F] text-2xl font-bold py-4 px-10 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                VOLVER
              </button>
            </div>
          </div>
        );
      default:
        return <MainMenu onNavigate={navigateTo} />;
    }
  };

  return (
    <div 
      className="min-h-screen font-sans selection:bg-[#FFD580] selection:text-[#001F3F]"
      style={{ backgroundColor: '#001F3F', color: '#FFFDD0' }}
    >
      {renderView()}
    </div>
  );
};

export default App;
