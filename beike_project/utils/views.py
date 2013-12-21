# Create your views here.
import re

def get_user_id(request):
	user_id = ''
	url = request.get_full_path()	
	m = re.search('/(.+?)/.+?',url)
	if m:
		user_id = m.group(1)
	return user_id
		

	
