import os


def setup(app):
    app.add_html_theme(
        'conestack',
        os.path.abspath(os.path.dirname(__file__))
    )
