import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const storedSession = localStorage.getItem('grupo-cordillera-session');

  if (!storedSession) {
    return next(req);
  }

  try {
    const session = JSON.parse(storedSession) as { token?: string };

    if (!session.token) {
      return next(req);
    }

    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${session.token}`,
        },
      }),
    );
  } catch {
    return next(req);
  }
};
