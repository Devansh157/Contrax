"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def api_root_view(request):
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Contrax API Portal</title>
        <meta http-equiv="refresh" content="1; url=http://localhost:5173/" />
        <style>
            body {
                background-color: #f1f5f9;
                color: #0f172a;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: #ffffff;
                border: 1px solid rgba(0, 0, 0, 0.08);
                border-radius: 16px;
                padding: 2.5rem;
                text-align: center;
                box-shadow: 0 10px 30px rgba(148, 163, 184, 0.12);
                max-width: 480px;
            }
            h1 {
                background: linear-gradient(90deg, #f59e0b, #0891b2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 0.5rem;
                font-size: 2.2rem;
                font-weight: 800;
            }
            p {
                color: #475569;
                margin-bottom: 1.8rem;
                font-size: 0.95rem;
                line-height: 1.5;
            }
            .btn {
                background-color: #f59e0b;
                color: #0f172a;
                padding: 0.8rem 1.6rem;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
                display: inline-block;
                transition: all 0.2s;
                border: none;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            }
            .btn:hover {
                background-color: #d97706;
                transform: translateY(-1px);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Contrax Gateway</h1>
            <p>Django REST API is operational. Redirecting you to the React Visual Dashboard in 1 second...</p>
            <a href="http://localhost:5173/" class="btn">Open React UI Dashboard</a>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/contracts/', include('contracts.urls')),
]



