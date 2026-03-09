varying float vWobble;

void main(){
    vec3  color  = vec3(1.0);
    float wobble = vWobble;

    color *= vec3(wobble);

    gl_FragColor = vec4(color, 1.0);
}