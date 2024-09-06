""" Note:
    We need to use functools wraps, or else @route thinks all functions
    are named the same, and errors out that a route is overriding another

Test Preflight with:
    curl -i -X OPTIONS http://127.0.0.1:5000/foo/
Then test reponse with:
    curl -i http://127.0.0.1:5000/api/foo/
"""

from functools import wraps

from flask import Response, request


def add_cors_preflight_headers(response):
    allow_request = 'foo' in request.origin
    if allow_request:
        response.headers['Access-Control-Allow-Origin'] = request.origin

    if request.method == 'OPTIONS':
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        # Allow chrome to access private network ajax requests
        response.headers['Access-Control-Allow-Private-Network'] = 'true'
    return response


def handle_cors(func):
    @wraps(func)
    def decorator(*args, **kwargs):
        if request.method == 'OPTIONS':
            response = Response()
        else:
            response = func(*args, **kwargs)
        response = add_cors_preflight_headers(response)
        return response

    return decorator