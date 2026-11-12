import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import style from "./style.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Captura falhas inesperadas de renderização ou carregamento de rotas lazy.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Erro inesperado na interface:", error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={style.card} role="alert">
          <h1 className={style.title}>Algo deu errado ao carregar esta página</h1>
          <p className={style.description}>
            Tente recarregar a página. Se estiver usando a rede da biblioteca, verifique sua conexão
            e tente novamente.
          </p>
          <button type="button" className={style.reloadBtn} onClick={this.handleReload}>
            <RefreshCw size={16} aria-hidden="true" />
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
