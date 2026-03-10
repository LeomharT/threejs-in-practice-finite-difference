varying float vWobble;
varying vec3 vNormal;

uniform vec3 uSunDirection;

void main(){
    float wobble = vWobble;
    vec3  color  = vec3(1.0);
    vec3  normal = normalize(vNormal);

    float lightClor = dot(normal, uSunDirection);

    color = vec3(lightClor);

    gl_FragColor = vec4(color, 1.0);
}