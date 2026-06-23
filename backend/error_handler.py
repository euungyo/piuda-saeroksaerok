from flask import jsonify

from backend.exceptions import CustomException
from backend.error_code import ErrorCode


def register_error_handlers(app):
    @app.errorhandler(CustomException)
    def handle_custom_exception(e):
        response = {
            "success": False,
            "message": e.error_code.message
        }

        if e.data:
            response["data"] = e.data

        return jsonify(response), e.error_code.status

    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({
            "success": False,
            "message": ErrorCode.INTERNAL_SERVER_ERROR.message
        }), ErrorCode.INTERNAL_SERVER_ERROR.status