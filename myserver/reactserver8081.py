import socket,mimetypes
s=socket.socket()
s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
s.bind(("0.0.0.0",8081))
s.listen(5)
print("REACT SERVER READY",flush=True)
while True:
 c,a=s.accept()
 r=c.recv(4096).decode("utf-8","ignore")
 p=r.split(" ")[1].split("?")[0]
 if p=="/": p="/index.html"
 f="."+p
 try:
  data=open(f,"rb").read()
  t=mimetypes.guess_type(f)[0] or "application/octet-stream"
  h=f"HTTP/1.1 200 OK\r\nContent-Type: {t}\r\nContent-Length: {len(data)}\r\nConnection: close\r\n\r\n".encode()
  c.sendall(h+data)
 except:
  data=b"Not Found"
  c.sendall(b"HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\n"+data)
 c.close()
