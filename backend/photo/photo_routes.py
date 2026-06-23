from flask import Blueprint


PhotoBlueprint = Blueprint(
    "Photo",
    __name__,
    url_prefix="/api/photos"
)


@PhotoBlueprint.route("/", methods=["GET"])
def PhotoGetList():

    return {
        "Success": True,
        "Message": "Photo API Successfully Connected",
        "Data": None
    }, 200