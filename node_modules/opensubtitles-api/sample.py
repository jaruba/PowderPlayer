import struct, os

def hashFile(name, size):
      try:
                debug = 0
                longlongformat = 'q'  # long long
                bytesize = struct.calcsize(longlongformat)

                f = open(name, "rb")

                filesize = os.path.getsize(name)
                print "filesize : %d" % filesize
                hash = 0

                if filesize < size * 2:
                       return "SizeError"

                for x in range(size/bytesize):
                        buffer = f.read(bytesize)
                        (l_value,)= struct.unpack(longlongformat, buffer)
                        #print hash
                        hash += l_value
                        if debug:
                            print "hash#1 %d %016x => %016x" % (x, l_value, hash)
                        hash = hash & 0xFFFFFFFFFFFFFFFF #to remain as 64bit number

                print "start buffer chcksum : %016x" % hash


                hash2 = 0
                f.seek(max(0,filesize-size),0)
                for x in range(size/bytesize):
                        buffer = f.read(bytesize)
                        (l_value,)= struct.unpack(longlongformat, buffer)
                        hash2 += l_value
                        hash2 = hash2 & 0xFFFFFFFFFFFFFFFF
                        if debug:
                            print "hash#2 %d %016x => %016x" % (x, l_value, hash2)

                f.close()

                print "end buffer chcksum : %016x" % hash2

				# hash+size a la fin
                hash += filesize
                hash = hash & 0xFFFFFFFFFFFFFFFF
                print "hash+filsesize %016x " % (hash)


                hash += hash2
                hash = hash & 0xFFFFFFFFFFFFFFFF
                print "^+hash2 %016x " % (hash)

                returnedhash =  "%016x" % hash
                return returnedhash

      except(IOError):
                return "IOError"


print "CHKSUM : 0x%s" % hashFile('/home/seb/dev/node-opensubtitles-api/test/breakdance.avi', 512);