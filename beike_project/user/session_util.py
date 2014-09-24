from data.models import UserValidation

def is_request_valid(request):
    wx_id = None
    key = None
    if request.method == "GET":
        wx_id = request.GET.get('wx_id')
        key = request.GET.get('key')
    # fallback to use wx_id and key in session if they exist
    if wx_id is None and 'wx_id' in request.session and 'key' in request.session:
        wx_id = request.session['wx_id']
        key = request.session['key']
    if wx_id is None or key is None:
            return False;
    else:
        qs = UserValidation.objects.filter(user_id = wx_id)
        if qs.exists():
            storedKey = qs[0]
            if key != storedKey.key:
                return False
            else:
                request.session['wx_id'] = wx_id
                request.session['key'] = key
                return True
        else:
            return False

def get_wx_id(request):
    wx_id = None
    if request.method == "GET":
        wx_id = request.GET.get('wx_id')
    if wx_id:
        return wx_id
    else:
        return request.session.get('wx_id')
