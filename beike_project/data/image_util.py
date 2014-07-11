import json

"""
Json serializable image metadata
"""
class ImageMetadata(object):
	def __init__(self, image_url = None, width = None, height = None):
		self.image_url = image_url
		self.width = width
		self.height = height

	def serialize(img_md):
		return json.dumps(img_md.__dict__)
	serialize = staticmethod(serialize)

	def serialize_list(img_md_list):
		dict_list = []
		for img_md in img_md_list:
			dict_list.append(img_md.__dict__)
		return json.dumps(dict_list)
	serialize_list = staticmethod(serialize_list)

	def deserialize(json_str):
		img_md = ImageMetadata()
		img_md.__dict__ = json.loads(json_str)
		return img_md
	deserialize = staticmethod(deserialize)

	def deserialize_list(json_str):
		dict_list = json.loads(json_str)
		img_md_list = []
		for img_md_dict in dict_list:
			img_md = ImageMetadata()
			img_md.__dict__ = img_md_dict
			img_md_list.append(img_md)
		return img_md_list
	deserialize_list = staticmethod(deserialize_list)

def get_default_image():
    image_list = []
    default_image_url = 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/default_profile_img.png'
    image = ImageMetadata(default_image_url, 1, 1)
    image_list.append(image)
    return ImageMetadata.serialize_list(image_list)

