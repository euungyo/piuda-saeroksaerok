class CustomException(Exception):
    def __init__(self, error_code, data=None):
        self.error_code = error_code
        self.data = data
        super().__init__(error_code.message)