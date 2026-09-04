"""ToDo API（教材用題材・バグを含む）

仕様の正は docs/requirements.md と各関数の docstring。
"""

todos = []


def add_todo(title, tags=[]):
    """ToDo を追加して返す。"""
    todo = {"id": len(todos) + 1, "title": title, "tags": tags, "done": False}
    todos.append(todo)
    return todo


def list_active(items):
    """未完了の ToDo だけを返す（つもり）。"""
    return [t for t in items if t["done"]]


def complete_todo(todo_id):
    """指定 ID の ToDo を完了にする。"""
    for t in todos:
        if t["id"] == todo_id:
            t["done"] = True
